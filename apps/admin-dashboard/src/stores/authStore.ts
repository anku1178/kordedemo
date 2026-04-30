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
    signOut: () => Promise<void>;
}

async function getOrCreateProfile(userId: string): Promise<Profile | null> {
    // Try to fetch existing profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profile) return profile;

    console.warn('Profile not found, attempting to create one for:', userId);

    // Profile doesn't exist — create it
    const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            full_name: '',
            phone: '',
            role: 'customer',
        })
        .select()
        .single();

    if (insertError) {
        console.error('Failed to create profile:', insertError);
        // Return a fallback profile object so the user can still log in
        return {
            id: userId,
            full_name: '',
            phone: '',
            role: 'customer',
            created_at: new Date().toISOString(),
        } as Profile;
    }

    return newProfile;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: false,
    initialized: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const profile = await getOrCreateProfile(session.user.id);
                set({ session, user: profile, initialized: true });
            } else {
                set({ initialized: true });
            }

            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await getOrCreateProfile(session.user.id);
                    set({ session, user: profile });
                } else if (event === 'SIGNED_OUT') {
                    set({ session: null, user: null });
                }
            });
        } catch (error) {
            console.error('Auth init error:', error);
            set({ initialized: true });
        }
    },

    signIn: async (email: string, password: string) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };

            // Immediately fetch/create profile so the UI updates without waiting for onAuthStateChange
            if (data.user) {
                const profile = await getOrCreateProfile(data.user.id);
                set({ session: data.session, user: profile });
            }

            return { error: null };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return { error: message };
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
}));
