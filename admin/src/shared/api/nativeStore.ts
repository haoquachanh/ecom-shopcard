let memorySettings: AdminSettings = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
};
let memoryTokens: TokenPayload | null = null;

const hasNative = () => typeof window !== 'undefined' && Boolean(window.adminNative);

export const nativeStore = {
  async getSettings() {
    if (hasNative()) return window.adminNative.getSettings();
    return memorySettings;
  },
  async setSettings(settings: AdminSettings) {
    if (hasNative()) return window.adminNative.setSettings(settings);
    memorySettings = settings;
  },
  async getTokens() {
    if (hasNative()) return window.adminNative.getTokens();
    return memoryTokens;
  },
  async setTokens(tokens: TokenPayload) {
    if (hasNative()) return window.adminNative.setTokens(tokens);
    memoryTokens = tokens;
  },
  async clearTokens() {
    if (hasNative()) return window.adminNative.clearTokens();
    memoryTokens = null;
  },
  async getAppVersion() {
    if (hasNative()) return window.adminNative.getAppVersion();
    return 'dev';
  },
};
