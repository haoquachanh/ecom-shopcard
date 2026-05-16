import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

type AdminSettings = {
  apiBaseUrl: string;
};

type TokenPayload = {
  accessToken: string;
  refreshToken?: string;
};

const defaultSettings: AdminSettings = {
  apiBaseUrl: process.env.VITE_API_URL || 'http://localhost:3001',
};

function getStorePath(fileName: string) {
  return path.join(app.getPath('userData'), fileName);
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(getStorePath(fileName), 'utf8');
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

async function writeJson<T>(fileName: string, payload: T) {
  await fs.mkdir(app.getPath('userData'), { recursive: true });
  await fs.writeFile(getStorePath(fileName), JSON.stringify(payload, null, 2), 'utf8');
}

function fallbackKey() {
  return crypto.createHash('sha256').update(app.getPath('userData')).digest();
}

function encryptTokens(payload: TokenPayload) {
  const plain = Buffer.from(JSON.stringify(payload), 'utf8');
  if (safeStorage.isEncryptionAvailable()) {
    return { mode: 'safeStorage', value: safeStorage.encryptString(plain.toString('utf8')).toString('base64') };
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', fallbackKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    mode: 'aes-256-gcm',
    value: Buffer.concat([iv, tag, encrypted]).toString('base64'),
  };
}

function decryptTokens(record: { mode: string; value: string }): TokenPayload | null {
  try {
    const data = Buffer.from(record.value, 'base64');
    if (record.mode === 'safeStorage') {
      return JSON.parse(safeStorage.decryptString(data));
    }

    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', fallbackKey(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
  } catch {
    return null;
  }
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1040,
    minHeight: 680,
    title: 'ShopCard Admin',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  win.removeMenu();

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    await win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  ipcMain.handle('settings:get', () => readJson<AdminSettings>('settings.json', defaultSettings));
  ipcMain.handle('settings:set', (_event, settings: AdminSettings) =>
    writeJson('settings.json', { ...defaultSettings, ...settings }),
  );
  ipcMain.handle('tokens:get', async () => {
    const record = await readJson<{ mode: string; value: string } | null>('tokens.json', null);
    return record ? decryptTokens(record) : null;
  });
  ipcMain.handle('tokens:set', (_event, tokens: TokenPayload) => writeJson('tokens.json', encryptTokens(tokens)));
  ipcMain.handle('tokens:clear', () => fs.rm(getStorePath('tokens.json'), { force: true }));
  ipcMain.handle('app:version', () => app.getVersion());

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
