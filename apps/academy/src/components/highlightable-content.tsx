import { cn } from '@blms/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoColorFill } from 'react-icons/io5';

import { trpc } from '#src/utils/trpc.js';

interface HighlightableContentProps {
  children: React.ReactNode;
  chapterId: string;
  className?: string;
  isLoggedIn?: boolean;
}

interface StoredHighlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  startContainerPath: string;
  endContainerPath: string;
}

/**
 * Get a simple path to identify a text node within a container
 */
function getNodePath(node: Node, container: HTMLElement): string {
  const path: number[] = [];
  let current: Node | null = node;

  while (current && current !== container) {
    const parent: ParentNode | null = current.parentNode;
    if (!parent) break;

    const children = Array.from(parent.childNodes);
    const index = children.indexOf(current as ChildNode);
    path.unshift(index);
    current = parent as Node;
  }

  return path.join('/');
}

/**
 * Get a node from a path within a container
 */
function getNodeFromPath(path: string, container: HTMLElement): Node | null {
  if (!path) return container;

  const indices = path.split('/').map(Number);
  let current: Node = container;

  for (const index of indices) {
    if (!current.childNodes[index]) return null;
    current = current.childNodes[index];
  }

  return current;
}

/**
 * Get all text nodes within a range
 */
function getTextNodesInRange(range: Range): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentNode!
      : range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip whitespace-only nodes (newlines between elements)
        if (!node.textContent || node.textContent.trim() === '') {
          return NodeFilter.FILTER_REJECT;
        }

        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(node);
        // Check if this text node intersects with our range
        if (
          range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
          range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      },
    },
  );

  let node: Node | null = walker.nextNode();

  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  return textNodes;
}

/**
 * Apply highlight to a range, handling multi-element selections properly
 */
function applyHighlightToRange(range: Range, highlightId: string): void {
  const textNodes = getTextNodesInRange(range);

  if (textNodes.length === 0) return;

  // Single text node - simple case
  if (
    textNodes.length === 1 &&
    range.startContainer === range.endContainer &&
    range.startContainer.nodeType === Node.TEXT_NODE
  ) {
    const mark = document.createElement('mark');
    mark.className =
      'bg-yellow-200 dark:bg-yellow-600/50 rounded-sm px-0.5 highlight-mark';
    mark.dataset.highlightId = highlightId;
    range.surroundContents(mark);
    return;
  }

  // Multiple text nodes - wrap each one
  for (let i = 0; i < textNodes.length; i++) {
    const textNode = textNodes[i];
    const mark = document.createElement('mark');
    mark.className =
      'bg-yellow-200 dark:bg-yellow-600/50 rounded-sm px-0.5 highlight-mark';
    mark.dataset.highlightId = highlightId;

    let startOffset = 0;
    let endOffset = textNode.length;

    // First node - start from selection start
    if (i === 0 && textNode === range.startContainer) {
      startOffset = range.startOffset;
    }

    // Last node - end at selection end
    if (i === textNodes.length - 1 && textNode === range.endContainer) {
      endOffset = range.endOffset;
    }

    // Skip empty selections
    if (startOffset >= endOffset) continue;

    // Create a range for just this portion
    const nodeRange = document.createRange();
    nodeRange.setStart(textNode, startOffset);
    nodeRange.setEnd(textNode, endOffset);

    try {
      nodeRange.surroundContents(mark);
    } catch {
      // If surroundContents fails, skip this node
      console.warn('Failed to highlight text node');
    }
  }
}

/**
 * Apply stored highlights to the DOM
 */
function applyStoredHighlights(
  highlights: StoredHighlight[],
  container: HTMLElement,
) {
  // Remove existing highlights first
  const existingMarks = Array.from(
    container.querySelectorAll('mark.highlight-mark'),
  );
  for (const mark of existingMarks) {
    const parent: ParentNode | null = mark.parentNode;
    if (parent) {
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      mark.remove();
    }
  }
  // Normalize to merge adjacent text nodes
  container.normalize();

  // Apply each highlight
  for (const highlight of highlights) {
    try {
      const startNode = getNodeFromPath(
        highlight.startContainerPath,
        container,
      );
      const endNode = getNodeFromPath(highlight.endContainerPath, container);

      if (!startNode || !endNode) continue;

      const range = document.createRange();
      range.setStart(startNode, highlight.startOffset);
      range.setEnd(endNode, highlight.endOffset);

      applyHighlightToRange(range, highlight.id);
    } catch (error) {
      console.warn('Failed to restore highlight:', highlight.id, error);
    }
  }
}

export function HighlightableContent({
  children,
  chapterId,
  className,
  isLoggedIn = false,
}: HighlightableContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionPosition, setSelectionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{
    text: string;
    range: Range;
  } | null>(null);
  const [highlightsApplied, setHighlightsApplied] = useState(false);

  const queryClient = useQueryClient();

  // Fetch existing highlights
  const { data: highlights } = useQuery({
    ...trpc.user.highlights.getHighlights.queryOptions({ chapterId }),
    enabled: isLoggedIn,
  });

  // Add highlight mutation
  const addHighlightMutation = useMutation({
    ...trpc.user.highlights.addHighlight.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.user.highlights.getHighlights.queryKey({ chapterId }),
      });
    },
  });

  // Apply stored highlights when they load
  useEffect(() => {
    if (!highlights || highlights.length === 0 || highlightsApplied) return;

    const tryApplyHighlights = (retries = 0) => {
      const container = containerRef.current;
      if (!container) return;

      // Check if content is actually rendered (not just the loader)
      const hasContent =
        container.textContent && container.textContent.length > 100;

      if (hasContent) {
        applyStoredHighlights(highlights, container);
        setHighlightsApplied(true);
      } else if (retries < 10) {
        // Retry after a short delay (content might still be loading)
        setTimeout(() => tryApplyHighlights(retries + 1), 200);
      }
    };

    // Start trying to apply highlights
    requestAnimationFrame(() => tryApplyHighlights());
  }, [highlights, highlightsApplied]);

  // Reset highlightsApplied when chapterId changes
  useEffect(() => {
    setHighlightsApplied(false);
  }, [chapterId]);

  const handleHighlight = useCallback(() => {
    if (!currentSelection || !containerRef.current) return;

    const { text, range } = currentSelection;

    const highlightData = {
      chapterId,
      text,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startContainerPath: getNodePath(
        range.startContainer,
        containerRef.current,
      ),
      endContainerPath: getNodePath(range.endContainer, containerRef.current),
    };

    // Apply visual highlight immediately
    const highlightId = crypto.randomUUID();
    applyHighlightToRange(range, highlightId);

    // Save to backend
    addHighlightMutation.mutate(highlightData);

    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelectionPosition(null);
    setCurrentSelection(null);
  }, [currentSelection, chapterId, isLoggedIn, addHighlightMutation]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (
        !selection ||
        selection.isCollapsed ||
        !containerRef.current ||
        selection.rangeCount === 0
      ) {
        // Small delay before hiding to allow clicking the button
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            setSelectionPosition(null);
            setCurrentSelection(null);
          }
        }, 100);
        return;
      }

      const range = selection.getRangeAt(0);

      // Check if selection is within our container
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setSelectionPosition(null);
        setCurrentSelection(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3 || !isLoggedIn) {
        setSelectionPosition(null);
        setCurrentSelection(null);
        return;
      }

      // Get position for the tooltip
      const rect = range.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setCurrentSelection({ text, range: range.cloneRange() });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isLoggedIn]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn('highlightable-content', className)}
      >
        {children}
      </div>

      {selectionPosition &&
        createPortal(
          <div
            className="fixed z-[100] animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: selectionPosition.x,
              top: selectionPosition.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              type="button"
              onClick={handleHighlight}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-newBlack-1 text-white rounded-lg shadow-lg hover:bg-newBlack-2 transition-colors text-sm font-medium"
              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
            >
              <IoColorFill className="size-4 text-yellow-400" />
              <span>Highlight</span>
            </button>
            {/* Arrow pointing down */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-newBlack-1" />
          </div>,
          document.body,
        )}
    </>
  );
}
