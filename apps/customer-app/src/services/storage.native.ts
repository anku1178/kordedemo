// Native implementation: uses MMKV for fast persistent storage
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

export const storage = {
    getItem: (key: string): string | null => {
        const value = mmkv.getString(key);
        return value ?? null;
    },
    setItem: (key: string, value: string): void => {
        mmkv.set(key, value);
    },
    removeItem: (key: string): void => {
        mmkv.delete(key);
    },
};
