import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Profile } from 'shared-types';

interface AuthState {
    user: Profile | null;
    session: any | null;
    loading: boolean;
    initialized: boolean;

    initialize: () => Promise<void>;
    signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
    verifyOtp: (phone: string, otp: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: false,
    initialized: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                set({ session, user: profile, initialized: true });
            } else {
                set({ initialized: true });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    set({ session, user: profile });
                } else if (event === 'SIGNED_OUT') {
                    set({ session: null, user: null });
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ initialized: true });
        }
    },

    signInWithPhone: async (phone: string) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
            });
            if (error) return { error: error.message };
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send OTP';
            return { error: message };
        } finally {
            set({ loading: false });
        }
    },

    verifyOtp: async (phone: string, otp: string) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: 'sms',
            });
            if (error) return { error: error.message };
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'OTP verification failed';
            return { error: message };
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },

    updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (!error) {
            set({ user: { ...user, ...updates } });
        }
    },
}));
