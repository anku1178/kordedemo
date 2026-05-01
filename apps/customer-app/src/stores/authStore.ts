import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Profile } from 'shared-types';

interface AuthState {
    user: Profile | null;
    session: any | null;
    loading: boolean;
    initialized: boolean;

    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

async function getOrCreateProfile(userId: string, email?: string): Promise<Profile | null> {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profile) {
            // Merge email from auth session (not stored in profiles table)
            return { ...profile, email: email || null } as Profile;
        }

        // Profile doesn't exist yet (trigger might not have fired), create it
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({ id: userId, role: 'customer' })
            .select()
            .single();

        if (error) {
            console.warn('Could not create profile:', error.message);
            return null;
        }

        return { ...newProfile, email: email || null } as Profile;
    } catch {
        return null;
    }
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
                const profile = await getOrCreateProfile(session.user.id, session.user.email);
                set({ session, user: profile, initialized: true });
            } else {
                set({ initialized: true });
            }

            supabase.auth.onAuthStateChange(async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                    const profile = await getOrCreateProfile(session.user.id, session.user.email);
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

    signIn: async (email: string, password: string) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Sign in failed';
            return { error: message };
        } finally {
            set({ loading: false });
        }
    },

    signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                },
            });
            if (error) return { error: error.message };
            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Sign up failed';
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
