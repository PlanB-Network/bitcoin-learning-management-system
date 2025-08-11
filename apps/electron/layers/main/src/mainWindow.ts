import { BrowserWindow } from 'electron';
import { join } from 'path';

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      // nativeWindowOpen: true,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../dist/preload/index.cjs'),
    },
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  window.on('ready-to-show', () => {
    console.log('BrowserWindow is ready to show');
    window?.show();

    // if (import.meta.env.DEV) {
    window?.webContents.openDevTools();
    // }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  // const pageUrl =
  //   import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
  //     ? import.meta.env.VITE_DEV_SERVER_URL
  //     : 'https://planb.network';

  // console.log('*****pageUrl', pageUrl);

  // await window.loadURL(pageUrl);
  await window.loadFile(join(__dirname, '../dist/web/index.html'));
  //trigger test: await browserWindow.loadFile('./dist/web/index.html');

  return window;
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow() {
  console.log('****restoreOrCreateWindow');
  let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
