// This file provides TypeScript types only.
// At bundle time, Metro resolves platform-specific files:
//   - storage.web.ts (for web)
//   - storage.native.ts (for native)
// This base file is the fallback and should NOT be imported at runtime.

export interface StorageAdapter {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}

// Default export for TypeScript type resolution
// (Metro will use .web.ts or .native.ts instead)
export const storage: StorageAdapter = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
};
