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
  /** Callback with OnlyOffice document dirty state (true = unsaved changes) */
  onDocumentStateChange?: (isDirty: boolean) => void;
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
      onDocumentStateChange,
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
    const isDocumentDirtyRef = useRef<boolean>(false);
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
    useImperativeHandle(
      ref,
      () => ({
        saveDocument: async () => {
          console.log('saveDocument called - checking editor state:', {
            editorInstance: !!editorInstanceRef.current,
            loadingState,
            documentKey: documentKeyRef.current,
            slideId,
          });

          if (loadingState !== 'ready') {
            console.error(
              'Editor not ready for saving. Current state:',
              loadingState,
            );
            throw new Error(
              `Editor not ready for saving. State: ${loadingState}`,
            );
          }

          if (!editorInstanceRef.current) {
            console.error(
              'Editor instance not available - editor may have been destroyed or not fully initialized',
            );
            console.error('Current state:', {
              loadingState,
              documentKey: documentKeyRef.current,
              slideId,
              courseId,
            });

            // Wait a short moment and retry once in case the editor is still initializing
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (!editorInstanceRef.current) {
              throw new Error('Editor instance not available after retry');
            }

            console.log('Editor instance became available after retry');
          }

          if (
            !courseId ||
            !partId ||
            !chapterId ||
            !slideId ||
            !language ||
            !fileName
          ) {
            console.error('Missing required parameters for save:', {
              courseId: !!courseId,
              partId: !!partId,
              chapterId: !!chapterId,
              slideId: !!slideId,
              language: !!language,
              fileName: !!fileName,
            });
            throw new Error('Missing required parameters for save');
          }

          try {
            console.log('Initiating manual save for:', {
              courseId,
              slideId,
              language,
            });

            isSavingRef.current = true;

            // Ensure in-editor changes are flushed to the Document Server before forcing a save.
            // This prevents saving the original file without recent edits when autosave is disabled.
            try {
              if (typeof editorInstanceRef.current?.save === 'function') {
                console.log('Triggering in-editor save to flush changes...');
                editorInstanceRef.current.save();
                // Give the editor a brief moment to transmit changes to the server
                await new Promise((resolve) => setTimeout(resolve, 1200));
              }
            } catch (flushErr) {
              console.warn(
                'Failed to trigger in-editor save (will proceed with forcesave):',
                flushErr,
              );
            }

            // Wait until OnlyOffice reports no pending changes (best-effort, max ~5s)
            try {
              const waitForStable = async () =>
                await new Promise<void>((resolve) => {
                  const start = Date.now();
                  const check = () => {
                    if (!isDocumentDirtyRef.current) return resolve();
                    if (Date.now() - start > 5000) return resolve();
                    setTimeout(check, 150);
                  };
                  check();
                });
              await waitForStable();
            } catch (_e) {
              // ignore
            }

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
                'Manual save requested successfully - waiting for S3 upload completion...',
              );

              // Poll for S3 upload completion instead of using arbitrary timeout
              let uploadCompleted = false;
              let pollAttempts = 0;
              const maxPollAttempts = 30; // 30 seconds max wait time

              while (!uploadCompleted && pollAttempts < maxPollAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
                pollAttempts++;

                try {
                  // Check if the proofread file exists in S3 using discovery (independent of DB flags)
                  const proofreadDiscoveryUrl = `/api/translation-downloads/pptx-by-discovery/${courseId}/${language}/${partId}/${chapterId}/${slideId}?suffix=proofread`;
                  const headResponse = await fetch(proofreadDiscoveryUrl, {
                    method: 'HEAD',
                    credentials: 'include',
                  });

                  if (headResponse.ok) {
                    console.log(
                      `S3 upload completed after ${pollAttempts} seconds`,
                    );
                    uploadCompleted = true;
                  } else {
                    console.log(
                      `S3 upload still in progress... attempt ${pollAttempts}`,
                    );
                  }
                } catch (error) {
                  console.warn('Error checking S3 upload status:', error);
                }
              }

              if (!uploadCompleted) {
                console.warn(
                  `S3 upload may still be in progress after ${maxPollAttempts} seconds`,
                );
              }
            } else if (result.error === 4) {
              // Error 4: No changes, nothing to save
              // Use backend to copy current version as proofread
              console.log(
                'No changes detected - requesting backend to create proofread copy...',
              );

              try {
                const copyResponse = await fetch(
                  '/api/translation-downloads/pptx-create-proofread-copy',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      courseId,
                      partId,
                      chapterId,
                      slideId,
                      language,
                      fileName,
                    }),
                    credentials: 'include',
                  },
                );

                if (!copyResponse.ok) {
                  throw new Error(
                    `Failed to create proofread copy: ${copyResponse.status}`,
                  );
                }

                const copyResult = await copyResponse.json();
                console.log('Proofread copy created successfully:', copyResult);

                // Verify the proofread version exists
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay for S3 consistency
                const verifyUrl = `/api/translation-downloads/pptx-by-path/${courseId}/${language}/${chapterId}/${slideId}?version=proofread`;
                const verifyResponse = await fetch(verifyUrl, {
                  method: 'HEAD',
                  credentials: 'include',
                });

                if (verifyResponse.ok) {
                  console.log('Proofread version verified successfully');
                } else {
                  console.warn(
                    'Could not verify proofread version, but creation succeeded',
                  );
                }
              } catch (copyError) {
                console.error('Error creating proofread copy:', copyError);
                throw new Error(
                  `Failed to create proofread version: ${copyError}`,
                );
              }
            } else if (result.error === 1) {
              // Error 1: Document key unknown - try alternative save method
              console.warn(
                'Forcesave failed with error 1 (document key unknown), trying alternative save method',
              );

              try {
                // Try using the built-in OnlyOffice save functionality
                if (typeof editorInstanceRef.current?.save === 'function') {
                  console.log(
                    'Attempting to trigger built-in OnlyOffice save...',
                  );
                  editorInstanceRef.current.save();

                  // Wait a bit for the save to process
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  console.log('Built-in save triggered successfully');
                } else {
                  throw new Error('Built-in save method not available');
                }
              } catch (saveError) {
                console.error(
                  'Alternative save method also failed:',
                  saveError,
                );
                throw new Error(
                  `Forcesave failed with error 1 and alternative save failed: ${saveError}`,
                );
              }
            } else {
              console.error('Forcesave command failed:', result);
              throw new Error(`Forcesave failed: ${result.error}`);
            }
          } catch (error) {
            console.error('Error during manual save:', error);
            isSavingRef.current = false;
            throw error;
          } finally {
            isSavingRef.current = false;
          }
        },
      }),
      [courseId, partId, chapterId, slideId, language, fileName, loadingState],
    );

    // Cleanup expired OnlyOffice sessions on component mount
    useEffect(() => {
      const cleanupExpiredSessions = () => {
        const maxSessionAge = 20 * 60 * 1000; // 20 minutes
        const currentTime = Date.now();

        // Get all sessionStorage keys that match our pattern
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('onlyoffice_session_')) {
            try {
              const sessionData = JSON.parse(
                sessionStorage.getItem(key) || '{}',
              );
              if (
                sessionData.timestamp &&
                currentTime - sessionData.timestamp > maxSessionAge
              ) {
                console.log('Cleaning up expired session:', key);
                sessionStorage.removeItem(key);
              }
            } catch (_error) {
              // Invalid JSON, remove the key
              sessionStorage.removeItem(key);
            }
          }
        }
      };

      cleanupExpiredSessions();
    }, []);

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
          const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

          const apiHost = isLocalhost
            ? 'host.docker.internal:3000'
            : `${window.location.host}`;

          // Prefer latest proofread version if it exists (even when not validated)
          // Try discovery endpoint for -proofread first, then fallback to by-path original
          let absoluteFileUrl: string;
          const discoveryProofread = `/api/translation-downloads/pptx-by-discovery/${courseId}/${language}/${partId}/${chapterId}/${slideId}?suffix=proofread`;
          const byPathOriginal = `/api/translation-downloads/pptx-by-path/${courseId}/${language}/${chapterId}/${slideId}`;

          // Load DocsAPI and check if file exists
          await loadDocsAPI();

          // Test if proofread exists first; if not, try original
          let testResp = await fetch(discoveryProofread, { method: 'HEAD' });
          if (testResp.ok) {
            absoluteFileUrl = discoveryProofread;
          } else {
            const fallbackResp = await fetch(byPathOriginal, {
              method: 'HEAD',
            });
            if (!fallbackResp.ok) {
              if (fallbackResp.status === 404) {
                console.warn('PPTX file not found (proofread and original)');
                setLoadingState('file-not-found');
              } else {
                console.error('Failed to access PPTX file');
                setLoadingState('error');
              }
              return;
            }
            absoluteFileUrl = byPathOriginal;
            testResp = fallbackResp;
          }
          if (isLocalhost) {
            // In development, OnlyOffice runs in Docker and needs to access the API
            // using host.docker.internal to maintain hostname consistency for callbacks
            const protocol = window.location.protocol;
            // Use host.docker.internal for OnlyOffice to ensure consistent hostname in callbacks
            absoluteFileUrl = `${protocol}//host.docker.internal:3000${absoluteFileUrl}`;
          } else {
            // Convert to full URL for production
            const protocol = window.location.protocol;
            const host = window.location.host;
            absoluteFileUrl = `${protocol}//${host}${absoluteFileUrl}`;
          }

          // Generate session-based document key with timestamp to avoid conflicts
          // Each session gets a unique key to prevent version conflicts
          const sessionKey = `${courseId}-${partId}-${chapterId}-${slideId}-${language}`;
          const sessionTimestamp = Date.now();

          // Check for existing session in sessionStorage and clean up old ones
          const sessionStorageKey = `onlyoffice_session_${sessionKey}`;
          const existingSession = sessionStorage.getItem(sessionStorageKey);

          let documentKey: string;

          if (existingSession) {
            const sessionData = JSON.parse(existingSession);
            const sessionAge = sessionTimestamp - sessionData.timestamp;
            const maxSessionAge = 20 * 60 * 1000; // 20 minutes in milliseconds

            // If session is older than 20 minutes, create a new one
            if (sessionAge > maxSessionAge) {
              console.log('Previous session expired, creating new session');
              documentKey =
                `${sessionTimestamp.toString(36).substring(-8)}${Math.random().toString(36).substring(2, 6)}`.substring(
                  0,
                  20,
                );
              sessionStorage.setItem(
                sessionStorageKey,
                JSON.stringify({
                  documentKey,
                  timestamp: sessionTimestamp,
                }),
              );
            } else {
              // Reuse existing session key
              documentKey = sessionData.documentKey;
              console.log('Reusing existing session key:', documentKey);
            }
          } else {
            // Create new session
            documentKey =
              `${sessionTimestamp.toString(36).substring(-8)}${Math.random().toString(36).substring(2, 6)}`.substring(
                0,
                20,
              );
            sessionStorage.setItem(
              sessionStorageKey,
              JSON.stringify({
                documentKey,
                timestamp: sessionTimestamp,
              }),
            );
            console.log('Created new session key:', documentKey);
          }

          // Only update the key if it's different to avoid unnecessary recreations
          const previousKey = documentKeyRef.current;
          documentKeyRef.current = documentKey;

          console.log(
            'Generated document key:',
            documentKey,
            'for slide:',
            slideId,
          );

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
                hideRightMenu: true,
                hideRulers: true,
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
                hideNotes: true,
                uiTheme: 'theme-gray',
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
                console.log(
                  'OnlyOffice editor is ready, instance:',
                  !!editorInstanceRef.current,
                );
                if (isMounted) {
                  setLoadingState('ready');
                }
              },
              onDocumentStateChange: (event: any) => {
                // event.data === true means there are unsaved changes (dirty)
                const isDirty = Boolean(event?.data);
                isDocumentDirtyRef.current = isDirty;
                console.log('Document state changed:', event);
                if (typeof onDocumentStateChange === 'function') {
                  try {
                    onDocumentStateChange(isDirty);
                  } catch {
                    /* ignore */
                  }
                }
                if (isDirty && onDocumentModified) {
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
              onRequestSaveAs: (_event: any) => {
                console.log('OnlyOffice requesting save as');
                return false;
              },
              onDownloadAs: (_event: any) => {
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
              onRequestRefreshFile: (event: any) => {
                console.log(
                  'OnlyOffice requesting file refresh due to version conflict:',
                  event,
                );
                // Force refresh by reloading the editor with a new document key
                if (
                  editorInstanceRef.current &&
                  typeof editorInstanceRef.current.refreshFile === 'function'
                ) {
                  try {
                    editorInstanceRef.current.refreshFile();
                    console.log('Document refreshed successfully');
                  } catch (error) {
                    console.error('Failed to refresh document:', error);
                    // Fallback: recreate the editor
                    window.location.reload();
                  }
                }
                return true;
              },
            },
            token: '',
          };

          // -------------------------------------------------
          // 3️⃣   Re-use existing editor instance if possible
          // -------------------------------------------------
          if (editorInstanceRef.current && previousKey === documentKey) {
            // Same document key, no need to recreate editor
            console.log(
              'Document key unchanged, keeping existing editor instance',
            );
            if (isMounted) setLoadingState('ready');
            return;
          }

          if (editorInstanceRef.current && previousKey !== documentKey) {
            try {
              const inst: any = editorInstanceRef.current;

              let swapped = false;

              // Preferred API: replaceDocument (DS ≥8)
              if (typeof inst.replaceDocument === 'function') {
                try {
                  inst.replaceDocument(config);
                  swapped = true;
                  console.log(
                    'Successfully hot-swapped document using replaceDocument',
                  );
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
                  console.log(
                    'Successfully hot-swapped document using loadDocument',
                  );
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
                  console.log(
                    'Successfully hot-swapped document using setDocumentConfig',
                  );
                } catch (e) {
                  console.warn('setDocumentConfig fallback failed', e);
                }
              }

              if (swapped) {
                // Update local state immediately
                if (isMounted) setLoadingState('ready');
                return; // Skip full re-initialisation
              }
              throw new Error('No supported hot-swap method succeeded');
            } catch (_err) {
              console.log(
                'Hot-swap failed, recreating editor for new document key:',
                documentKey,
              );
              // If hot-swap fails, destroy and recreate below
              try {
                editorInstanceRef.current.destroy?.();
              } catch (_) {
                /* ignore */
              }
              // Don't immediately set to null - will be set properly after new editor creation
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

                // Create the editor instance
                const newEditorInstance = new (window as any).DocsAPI.DocEditor(
                  editorId.current,
                  config,
                );

                // Set the reference immediately after creation
                editorInstanceRef.current = newEditorInstance;

                console.log(
                  'OnlyOffice editor instance created:',
                  !!editorInstanceRef.current,
                  'for slide:',
                  slideId,
                );
              } catch (error) {
                console.error('Error creating OnlyOffice editor:', error);
                editorInstanceRef.current = null;
                if (isMounted) {
                  setLoadingState('error');
                }
              }
            }, 100);
          }

          // Store cleanup function
          cleanupRef.current = () => {
            if (editorInstanceRef.current) {
              console.log(
                'Destroying OnlyOffice editor instance for slide:',
                slideId,
              );
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
              console.log(
                'OnlyOffice editor instance set to null for slide:',
                slideId,
              );
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

        // Clean up session storage entry for this slide
        if (courseId && partId && chapterId && slideId && language) {
          const sessionKey = `${courseId}-${partId}-${chapterId}-${slideId}-${language}`;
          const sessionStorageKey = `onlyoffice_session_${sessionKey}`;
          sessionStorage.removeItem(sessionStorageKey);
          console.log('Cleaned up session storage for slide:', slideId);
        }
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

// Force remount when slide changes to avoid DOM reconciliation issues
export const OnlyOfficeSlideEditor = memo(
  OnlyOfficeSlideEditorInner,
  (prev, next) => {
    // Force remount if slide changes to prevent React DOM reconciliation errors
    if (prev.slideId !== next.slideId) {
      return false;
    }

    return (
      prev.fileUrl === next.fileUrl &&
      prev.language === next.language &&
      prev.chapterId === next.chapterId &&
      prev.partId === next.partId &&
      prev.courseId === next.courseId &&
      prev.mode === next.mode
    );
  },
);
