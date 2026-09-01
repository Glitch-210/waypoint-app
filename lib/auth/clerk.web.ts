// Web stub for expo-secure-store — uses localStorage on web
// Metro resolves .web.ts files first on the web platform.

export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
};
