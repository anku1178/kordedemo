// Base types for storage - platform-specific files override this
// Metro resolves storage.web.ts on web, storage.native.ts on native
export interface StorageAdapter {
    getItem: (key: string) => string | null | Promise<string | null>;
    setItem: (key: string, value: string) => void | Promise<void>;
    removeItem: (key: string) => void | Promise<void>;
}

// Default no-op implementation (overridden by platform-specific files)
export const storage: StorageAdapter = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
};
