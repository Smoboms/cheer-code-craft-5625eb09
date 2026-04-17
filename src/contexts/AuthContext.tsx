import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const syncRequestRef = useRef(0);

  const generateCardNumber = () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');

  const resetUserState = useCallback(() => {
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const ensureProfile = useCallback(async (authUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.id,
          email: authUser.email ?? null,
          name: authUser.user_metadata?.full_name ?? '',
          card_number: generateCardNumber(),
        })
        .select('*')
        .single();

      if (!insertError && createdProfile) {
        return createdProfile;
      }

      if (insertError?.code !== '23505') {
        throw insertError;
      }
    }

    throw new Error('Não foi possível preparar o perfil do usuário');
  }, []);

  const checkAdmin = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }, []);

  const syncAuthState = useCallback(async (nextSession: Session | null) => {
    const requestId = ++syncRequestRef.current;

    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      resetUserState();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [profileResult, adminResult] = await Promise.allSettled([
      ensureProfile(nextSession.user),
      checkAdmin(nextSession.user.id),
    ]);

    if (requestId !== syncRequestRef.current) return;

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    } else {
      console.error('Profile sync error:', profileResult.reason);
      setProfile(null);
    }

    if (adminResult.status === 'fulfilled') {
      setIsAdmin(adminResult.value);
    } else {
      console.error('Admin check error:', adminResult.reason);
      setIsAdmin(false);
    }

    setIsLoading(false);
  }, [checkAdmin, ensureProfile, resetUserState]);

  const refreshProfile = async () => {
    if (user) {
      const refreshedProfile = await ensureProfile(user);
      setProfile(refreshedProfile);
    }
  };

  useEffect(() => {
    let mounted = true;
    let loadingFallbackId: number | null = null;

    const initSession = async () => {
      try {
        try {
          const storageKeys = Object.keys(localStorage);
          for (const key of storageKeys) {
            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
              const value = localStorage.getItem(key);
              if (value) {
                try {
                  JSON.parse(value);
                } catch {
                  console.warn('Removing corrupted auth token from localStorage');
                  localStorage.removeItem(key);
                }
              }
            }
          }
        } catch (e) {
          console.warn('localStorage cleanup error:', e);
        }

        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) throw error;

        await syncAuthState(data.session);
      } catch (err) {
        console.error('Session init error:', err);
        if (mounted) {
          resetUserState();
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!mounted) return;

          void syncAuthState(nextSession);
        }
      );

      loadingFallbackId = window.setTimeout(() => {
        if (mounted) {
          console.warn('Auth bootstrap fallback activated');
          setIsLoading(false);
        }
      }, 8000);

      void initSession();

      return () => {
        mounted = false;
        subscription.unsubscribe();
        if (loadingFallbackId) {
          window.clearTimeout(loadingFallbackId);
        }
      };
    } catch (err) {
      console.error('Auth state change error:', err);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      if (loadingFallbackId) {
        window.clearTimeout(loadingFallbackId);
      }
    };
  }, [resetUserState, syncAuthState]);

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      isAdmin,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
