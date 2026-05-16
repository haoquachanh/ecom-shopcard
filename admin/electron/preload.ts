import { contextBridge, ipcRenderer } from 'electron';

type AdminSettings = {
  apiBaseUrl: string;
};

type TokenPayload = {
  accessToken: string;
  refreshToken?: string;
};

const nativeApi = {
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<AdminSettings>,
  setSettings: (settings: AdminSettings) => ipcRenderer.invoke('settings:set', settings) as Promise<void>,
  getTokens: () => ipcRenderer.invoke('tokens:get') as Promise<TokenPayload | null>,
  setTokens: (tokens: TokenPayload) => ipcRenderer.invoke('tokens:set', tokens) as Promise<void>,
  clearTokens: () => ipcRenderer.invoke('tokens:clear') as Promise<void>,
  getAppVersion: () => ipcRenderer.invoke('app:version') as Promise<string>,
};

contextBridge.exposeInMainWorld('adminNative', nativeApi);
