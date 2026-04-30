import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { storage } from './storage';

// On web, Constants.expoConfig?.extra may be empty, so we provide fallback values
const supabaseUrl =
    Constants.expoConfig?.extra?.supabaseUrl ||
    'https://hfuafzhyqcgterzmajtg.supabase.co';
const supabaseAnonKey =
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdWFmemh5cWNndGVyem1hanRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTU3ODgsImV4cCI6MjA5MzEzMTc4OH0.ClZee3_P9nCGjTUz7VnSwzlT4aT-921RJH5OpoCMeE8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
