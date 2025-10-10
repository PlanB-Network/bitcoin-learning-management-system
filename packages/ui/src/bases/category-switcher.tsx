import { cva } from 'class-variance-authority';
import { useRef } from 'react';
import type { IconType } from 'react-icons/lib';
import { cn } from '#src/lib/utils.ts';

export const CategorySwitcherBar = ({
  children,
}: {
  children: React.ReactNode[];
}) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const preventClick = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = elRef.current;
    if (!el) return;
    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    startScroll.current = el.scrollLeft;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = elRef.current;
    if (!el || !dragging.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) moved.current = true;
    el.scrollLeft = startScroll.current - dx;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragging.current && moved.current) {
      preventClick.current = true;
    }
    dragging.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (preventClick.current) {
      e.stopPropagation();
      e.preventDefault();
      preventClick.current = false;
    }
  };

  return (
    <div
      ref={elRef}
      className="flex gap-2 items-center overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
};

const categorySwitcherVariant = cva(
  'flex gap-1 items-center rounded-full text-nowrap shrink-0',
  {
    defaultVariants: {
      size: 'm',
      isActive: false,
    },
    variants: {
      size: {
        s: 'body-extra-small-bold p-2',
        m: 'body-small-bold px-3 py-2',
      },
      isActive: {
        true: 'text-white bg-orange-500',
        false: 'text-neutral-700',
      },
    },
  },
);

export const CategorySwitcher = ({
  text,
  icon: Icon,
  isActive,
  onClick,
  size = 'm',
  inactiveBackgroundColor = 'bg-neutral-50',
  className,
}: {
  text?: string;
  icon?: IconType;
  isActive: boolean;
  onClick: () => void;
  size?: 'm' | 's';
  inactiveBackgroundColor?: string;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        categorySwitcherVariant({ size, isActive }),
        !isActive ? inactiveBackgroundColor : '',
        className,
      )}
      onClick={onClick}
      aria-pressed={isActive}
      type="button"
    >
      {Icon && <Icon size={16} className="max-md:hidden" />}
      {text}
    </button>
  );
};
