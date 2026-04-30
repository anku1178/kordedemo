import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { MMKV } from 'react-native-mmkv';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// MMKV-based storage for Supabase auth persistence
const mmkv = new MMKV();

const storage = {
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
