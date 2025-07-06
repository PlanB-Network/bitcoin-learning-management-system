import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

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
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<any>(null);
    const documentKeyRef = useRef<string | null>(null);
    // Track manual save status without triggering React re-renders (DOM reconciliation issues)
    const isSavingRef = useRef(false);
    const [loadingState, setLoadingState] = useState<
      'loading' | 'ready' | 'error'
    >('loading');
    const editorId = useRef(
      `onlyoffice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    );
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

          // Request download token
          const tokenResp = await fetch(
            '/api/translation-downloads/pptx-token',
            {
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
            },
          );

          if (!tokenResp.ok) {
            console.error('Failed to obtain OnlyOffice download token');
            setLoadingState('error');
            return;
          }

          const { downloadUrl } = await tokenResp.json();

          let absoluteFileUrl: string = downloadUrl as string;
          if (isHybridDev) {
            absoluteFileUrl = absoluteFileUrl
              .replace('localhost:3000', apiHost)
              .replace('127.0.0.1:3000', apiHost);
          }

          // Generate document key
          const documentKey = btoa(absoluteFileUrl).replace(
            /[^a-zA-Z0-9]/g,
            '',
          );
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
                edit: true,
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
              mode: 'edit',
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
                compactToolbar: false,
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

          // Load OnlyOffice API script if not already loaded
          if (!(window as any).DocsAPI) {
            const script = document.createElement('script');
            script.src = 'http://localhost/web-apps/apps/api/documents/api.js';
            script.onload = () => {
              if (
                isMounted &&
                containerRef.current &&
                (window as any).DocsAPI
              ) {
                // Small delay to ensure container is fully ready
                setTimeout(() => {
                  if (isMounted && containerRef.current) {
                    try {
                      console.log(
                        'Creating OnlyOffice editor with ID:',
                        editorId.current,
                      );
                      editorInstanceRef.current = new (
                        window as any
                      ).DocsAPI.DocEditor(editorId.current, config);
                    } catch (error) {
                      console.error('Error creating OnlyOffice editor:', error);
                      if (isMounted) {
                        setLoadingState('error');
                      }
                    }
                  }
                }, 100);
              }
            };
            script.onerror = () => {
              console.error('Failed to load OnlyOffice API script');
              if (isMounted) {
                setLoadingState('error');
              }
            };
            document.head.appendChild(script);
          } else {
            // OnlyOffice API already loaded
            if (isMounted && containerRef.current) {
              // Small delay to ensure container is fully ready
              setTimeout(() => {
                if (isMounted && containerRef.current) {
                  try {
                    console.log(
                      'Creating OnlyOffice editor with ID:',
                      editorId.current,
                    );
                    editorInstanceRef.current = new (
                      window as any
                    ).DocsAPI.DocEditor(editorId.current, config);
                  } catch (error) {
                    console.error('Error creating OnlyOffice editor:', error);
                    if (isMounted) {
                      setLoadingState('error');
                    }
                  }
                }
              }, 100);
            }
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
    prev.courseId === next.courseId,
);
