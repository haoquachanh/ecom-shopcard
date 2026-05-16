/// <reference types="vite/client" />

type AdminSettings = {
  apiBaseUrl: string;
};

type TokenPayload = {
  accessToken: string;
  refreshToken?: string;
};

interface Window {
  adminNative: {
    getSettings: () => Promise<AdminSettings>;
    setSettings: (settings: AdminSettings) => Promise<void>;
    getTokens: () => Promise<TokenPayload | null>;
    setTokens: (tokens: TokenPayload) => Promise<void>;
    clearTokens: () => Promise<void>;
    getAppVersion: () => Promise<string>;
  };
}
