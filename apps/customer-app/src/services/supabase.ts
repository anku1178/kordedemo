import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// On web, Constants.expoConfig?.extra may be empty, so we provide fallback values
const supabaseUrl =
    Constants.expoConfig?.extra?.supabaseUrl ||
    'https://hfuafzhyqcgterzmajtg.supabase.co';
const supabaseAnonKey =
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdWFmemh5cWNndGVyem1hanRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTU3ODgsImV4cCI6MjA5MzEzMTc4OH0.ClZee3_P9nCGjTUz7VnSwzlT4aT-921RJH5OpoCMeE8';

// Platform-aware storage: localStorage on web, MMKV on native
let storage: any;

if (Platform.OS === 'web') {
    storage = {
        getItem: (key: string) => localStorage.getItem(key),
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: (key: string) => localStorage.removeItem(key),
    };
} else {
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV();
    storage = {
        getItem: (key: string) => {
            const value = mmkv.getString(key);
            return value ?? null;
        },
        setItem: (key: string, value: string) => {
            mmkv.set(key, value);
        },
        removeItem: (key: string) => {
            mmkv.delete(key);
        },
    };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
