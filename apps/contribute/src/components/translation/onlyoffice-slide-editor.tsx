import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { loadDocsAPI } from '#src/utils/onlyoffice-loader.ts';
// Kick-off script preload as soon as this module is evaluated (fire-and-forget)
loadDocsAPI().catch(() => {
  // Errors will also surface again when individual editors await the loader
});

interface OnlyOfficeSlideEditorProps {
  /** Absolute or relative URL of the PPTX file to edit */
  fileUrl: string | null;
  /** Optional additional className */
  className?: string;
  /** Callback when document is modified */
  onDocumentModified?: () => void;
  /** Course ID for manual saving */
  courseId?: string;
  /** Part ID for manual saving */
  partId?: string;
  /** Chapter ID for manual saving */
  chapterId?: string;
  /** Slide ID for manual saving */
  slideId?: string;
  /** Base file name (e.g., 1.1_0) without extension */
  fileName?: string;
  /** Language for manual saving */
  language?: string;
  /** Editor mode. Use "view" for read-only viewer. Defaults to "edit". */
  mode?: 'view' | 'edit';
}

export interface OnlyOfficeSlideEditorRef {
  /** Save the current document content */
  saveDocument: () => Promise<void>;
}

/**
 * OnlyOffice Document Server presentation editor component.
 *
 * This component uses the OnlyOffice JavaScript API to properly initialize
 * the presentation editor with the correct configuration.
 */
const OnlyOfficeSlideEditorInner = forwardRef<
  OnlyOfficeSlideEditorRef,
  OnlyOfficeSlideEditorProps
>(
  (
    {
      fileUrl,
      className,
      onDocumentModified,
      courseId,
      partId,
      chapterId,
      slideId,
      language,
      fileName,
      mode = 'edit',
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<any>(null);
    const documentKeyRef = useRef<string | null>(null);
    // Track manual save status without triggering React re-renders (DOM reconciliation issues)
    const isSavingRef = useRef(false);
    const [loadingState, setLoadingState] = useState<
      'loading' | 'ready' | 'error' | 'file-not-found'
    >('loading');
    const editorId = useRef(
      `onlyoffice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    );
    const { t } = useTranslation();
    const cleanupRef = useRef<(() => void) | null>(null);

    // Expose saveDocument method to parent component
    useImperativeHandle(ref, () => ({
      saveDocument: async () => {
        if (
          !editorInstanceRef.current ||
          !courseId ||
          !partId ||
          !chapterId ||
          !slideId ||
          !language ||
          !fileName
        ) {
          console.error(
            'Editor not initialized or missing required parameters',
          );
          return;
        }

        try {
          console.log('Initiating manual save for:', {
            courseId,
            slideId,
            language,
          });

          isSavingRef.current = true;

          const documentKey = documentKeyRef.current;
          if (!documentKey) {
            console.error(
              'Document key not available – editor may not have initialised yet',
            );
            return;
          }
          const commandUrl = '/api/translation-downloads/pptx-forcesave';

          const commandBody = {
            documentKey,
            courseId,
            partId,
            chapterId,
            slideId,
            language,
            fileName,
          };

          console.log('Sending forcesave command via proxy:', commandBody);

          const response = await fetch(commandUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(commandBody),
            credentials: 'include',
          });

          const result = await response.json();
          console.log('Forcesave command result:', result);

          if (result.error === 0) {
            console.log(
              'Manual save requested successfully - waiting for callback...',
            );

            setTimeout(() => {
              isSavingRef.current = false;
              console.log('Manual save process completed');
            }, 5000);
          } else {
            console.error('Forcesave command failed:', result);
            isSavingRef.current = false;
          }
        } catch (error) {
          console.error('Error during manual save:', error);
          isSavingRef.current = false;
        }
      },
    }));

    useEffect(() => {
      if (!fileUrl) {
        setLoadingState('loading');
        return;
      }

      let isMounted = true;

      const initializeEditor = async () => {
        try {
          if (!containerRef.current || !isMounted) return;

          setLoadingState('loading');

          if (
            !courseId ||
            !partId ||
            !chapterId ||
            !slideId ||
            !language ||
            !fileName
          ) {
            console.error(
              'Missing path parameters for OnlyOffice initialization',
            );
            setLoadingState('error');
            return;
          }

          // Determine API host for callback URLs
          const isHybridDev =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
          const apiHost = isHybridDev
            ? 'host.docker.internal:3000'
            : 'api:3000';

          // Kick off DocsAPI loading and token request concurrently
          const tokenPromise = fetch('/api/translation-downloads/pptx-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId,
              partId,
              chapterId,
              slideId,
              language,
              fileName,
            }),
          });

          const [, tokenResp] = await Promise.all([
            loadDocsAPI(),
            tokenPromise,
          ]);

          if (!tokenResp.ok) {
            if (tokenResp.status === 404) {
              console.warn('PPTX file not found (token endpoint)');
              setLoadingState('file-not-found');
            } else {
              console.error('Failed to obtain OnlyOffice download token');
              setLoadingState('error');
            }
            return;
          }

          const { downloadUrl } = await tokenResp.json();

          let absoluteFileUrl: string = downloadUrl as string;
          if (isHybridDev) {
            absoluteFileUrl = absoluteFileUrl
              .replace('localhost:3000', apiHost)
              .replace('127.0.0.1:3000', apiHost);
          }

          // Generate a stable *unique* document key. Must be 1-20 ASCII chars.
          // We create a short deterministic hash of the raw identifier to
          // guarantee uniqueness across languages/slides while respecting the
          // 20-char limit imposed by Document Server.
          const rawKey = `${courseId}-${partId}-${chapterId}-${slideId}-${language}`;

          const hashFn = (str: string) => {
            // 32-bit FNV-1a hash for good distribution and speed.
            let hash = 2166136261;
            for (let i = 0; i < str.length; i++) {
              hash ^= str.charCodeAt(i);
              hash = (hash * 16777619) >>> 0; // >>> 0 ensures unsigned 32-bit
            }
            return hash.toString(36); // base-36 yields compact alphanum string
          };

          const documentKey = hashFn(rawKey).substring(0, 20);
          documentKeyRef.current = documentKey;

          console.log('OnlyOffice initialization params:', {
            editorId: editorId.current,
            documentKey,
            absoluteFileUrl,
            apiHost,
          });

          // OnlyOffice configuration
          const config: any = {
            document: {
              fileType: 'pptx',
              key: documentKey,
              title: 'Slide.pptx',
              url: absoluteFileUrl,
              permissions: {
                comment: true,
                download: true,
                edit: mode !== 'view',
                fillForms: true,
                modifyFilter: true,
                modifyContentControl: true,
                review: true,
                chat: false,
                reviewGroups: [''],
                userInfoGroups: [''],
                protect: false,
              },
              info: {
                favorite: false,
                folder: '',
                owner: 'Translator',
                sharingSettings: [],
                uploaded: new Date().toISOString(),
              },
            },
            documentType: 'slide',
            editorConfig: {
              mode,
              lang: 'en',
              callbackUrl: `${window.location.protocol}//${apiHost}/api/translation-downloads/pptx-callback?courseId=${courseId}&partId=${partId}&chapterId=${chapterId}&slideId=${slideId}&language=${language}&fileName=${fileName}`,
              coEditing: {
                mode: 'fast',
                change: false,
              },
              user: {
                id: 'user-1',
                name: 'Translator',
              },
              customization: {
                autosave: false,
                forcesave: false,
                commentAuthorOnly: false,
                comments: true,
                compactToolbar: mode === 'view',
                compatibleFeatures: false,
                customer: {
                  address: '',
                  info: '',
                  logo: '',
                  mail: '',
                  name: '',
                  phone: '',
                  www: '',
                },
                feedback: {
                  url: '',
                  visible: false,
                },
                goback: {
                  url: '',
                  text: '',
                },
                hideRightMenu: false,
                hideRulers: false,
                integrationMode: 'embed',
                macros: false,
                macrosMode: 'warn',
                mentionShare: false,
                plugins: true,
                toolbarHideFileName: false,
                toolbarNoTabs: false,
                unit: 'cm',
                zoom: -1,
                features: {
                  spellcheck: true,
                },
                anonymous: {
                  request: false,
                  label: 'Anonymous',
                },
                reviewDisplay: 'original',
                trackChanges: false,
                hideNotes: false,
                uiTheme: 'theme-classic-light',
                toolbar: {
                  file: {
                    save: false,
                    print: false,
                  },
                },
              },
            },
            height: '600px',
            width: '100%',
            events: {
              onAppReady: () => {
                console.log('OnlyOffice editor is ready');
                if (isMounted) {
                  setLoadingState('ready');
                }
              },
              onDocumentStateChange: (event: any) => {
                console.log('Document state changed:', event);
                if (onDocumentModified) {
                  onDocumentModified();
                }
              },
              onError: (event: any) => {
                console.error('OnlyOffice error:', event);
                if (event.data?.error) {
                  console.error('Error details:', event.data.error);
                }
                if (isMounted) {
                  setLoadingState('error');
                }
              },
              onRequestRestore: () => {
                console.log('OnlyOffice requesting document restore');
                return false;
              },
              onRequestSaveAs: (event: any) => {
                console.log('OnlyOffice requesting save as');
                return false;
              },
              onDownloadAs: (event: any) => {
                console.log('OnlyOffice downloading document');
                return false;
              },
              onRequestSave: () => {
                console.log('OnlyOffice requesting save');
                return false;
              },
              onRequestClose: () => {
                console.log('OnlyOffice requesting close');
                return false;
              },
            },
            token: '',
          };

          // -------------------------------------------------
          // 3️⃣   Re-use existing editor instance if possible
          // -------------------------------------------------
          if (editorInstanceRef.current) {
            try {
              const inst: any = editorInstanceRef.current;

              let swapped = false;

              // Preferred API: replaceDocument (DS ≥8)
              if (typeof inst.replaceDocument === 'function') {
                try {
                  inst.replaceDocument(config);
                  swapped = true;
                } catch (e) {
                  console.warn(
                    'replaceDocument failed, will try alternative path',
                    e,
                  );
                }
              }

              // Older API: loadDocument (DS 6–7)
              if (!swapped && typeof inst.loadDocument === 'function') {
                try {
                  inst.loadDocument(config.document, config.editorConfig);
                  swapped = true;
                } catch (e) {
                  console.warn(
                    'loadDocument failed, fallback to setDocumentConfig',
                    e,
                  );
                }
              }

              // DS 9: setDocumentConfig per-field + refresh
              if (!swapped && typeof inst.setDocumentConfig === 'function') {
                try {
                  inst.setDocumentConfig('key', documentKey);
                  inst.setDocumentConfig('url', absoluteFileUrl);
                  if (typeof inst.refresh === 'function') {
                    inst.refresh();
                  }
                  swapped = true;
                } catch (e) {
                  console.warn('setDocumentConfig fallback failed', e);
                }
              }

              if (!swapped) {
                throw new Error('No supported hot-swap method succeeded');
              }

              // Update local state immediately
              if (isMounted) setLoadingState('ready');
              return; // Skip full re-initialisation
            } catch (err) {
              console.warn('Hot-swap failed, recreating editor', err);
              // If hot-swap fails, destroy and recreate below
              try {
                editorInstanceRef.current.destroy?.();
              } catch (_) {
                /* ignore */
              }
              editorInstanceRef.current = null;
            }
          }

          // DocsAPI is guaranteed to be available at this point (loaded in parallel with token request)
          if (isMounted && containerRef.current) {
            // Small delay to ensure container is fully ready
            setTimeout(() => {
              if (!isMounted || !containerRef.current) return;

              try {
                // Prevent duplicate editors if the effect reruns quickly
                if (editorInstanceRef.current) {
                  editorInstanceRef.current.destroy?.();
                  editorInstanceRef.current = null;
                }

                console.log(
                  'Creating OnlyOffice editor with ID:',
                  editorId.current,
                );

                // Additional safety check - ensure container is still in DOM
                if (!document.body.contains(containerRef.current)) {
                  console.warn(
                    'OnlyOffice container no longer in DOM, skipping initialization',
                  );
                  return;
                }

                editorInstanceRef.current = new (
                  window as any
                ).DocsAPI.DocEditor(editorId.current, config);
              } catch (error) {
                console.error('Error creating OnlyOffice editor:', error);
                if (isMounted) {
                  setLoadingState('error');
                }
              }
            }, 100);
          }

          // Store cleanup function
          cleanupRef.current = () => {
            if (editorInstanceRef.current) {
              try {
                if (
                  typeof editorInstanceRef.current.destroyEditor === 'function'
                ) {
                  editorInstanceRef.current.destroyEditor();
                } else if (
                  typeof editorInstanceRef.current.destroy === 'function'
                ) {
                  editorInstanceRef.current.destroy();
                }
              } catch (error) {
                console.warn('Error destroying OnlyOffice editor:', error);
              }
              editorInstanceRef.current = null;
            }
          };
        } catch (error) {
          console.error('Error initializing OnlyOffice editor:', error);
          if (isMounted) {
            setLoadingState('error');
          }
        }
      };

      initializeEditor();

      return () => {
        isMounted = false;

        // Run cleanup
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }

        // Clear references
        documentKeyRef.current = null;
      };
    }, [
      fileUrl,
      courseId,
      partId,
      chapterId,
      slideId,
      language,
      fileName,
      onDocumentModified,
      mode,
    ]);

    if (!fileUrl) {
      return <div className={className}>No slide selected…</div>;
    }

    return (
      <div className={className}>
        {loadingState === 'loading' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '600px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          >
            <div style={{ color: '#666' }}>Loading editor...</div>
          </div>
        )}
        {loadingState === 'file-not-found' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '600px',
              backgroundColor: '#fffbeb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                color: '#d97706',
                marginBottom: '8px',
                fontSize: '18px',
              }}
            >
              {t('translate.slideNotFound', {
                defaultValue: '⚠️ Slide not found',
              })}
            </div>
            <div
              style={{
                color: '#92400e',
                textAlign: 'center',
                maxWidth: '400px',
              }}
            >
              {t('translate.slideNotFoundDescription', {
                defaultValue:
                  "This slide file doesn't exist. Please contact support for assistance.",
              })}
            </div>
          </div>
        )}
        {loadingState === 'error' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '600px',
              backgroundColor: '#fef2f2',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          >
            <div style={{ color: '#dc2626' }}>
              Error loading editor. Please try again.
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          id={editorId.current}
          style={{
            width: '100%',
            height: '600px',
            display: loadingState === 'ready' ? 'block' : 'none',
          }}
        />
      </div>
    );
  },
);

// Memoize to avoid React re-rendering (and diffing) the DOM altered by OnlyOffice once mounted.
export const OnlyOfficeSlideEditor = memo(
  OnlyOfficeSlideEditorInner,
  (prev, next) =>
    prev.fileUrl === next.fileUrl &&
    prev.language === next.language &&
    prev.slideId === next.slideId &&
    prev.chapterId === next.chapterId &&
    prev.partId === next.partId &&
    prev.courseId === next.courseId &&
    prev.mode === next.mode,
);
