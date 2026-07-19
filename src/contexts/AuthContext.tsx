import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type AccountType = 'client' | 'company';

const ACTIVE_TYPE_KEY = 'rarques.active_account_type';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  profiles: Profile[];
  activeAccountType: AccountType | null;
  hasClientProfile: boolean;
  hasCompanyProfile: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchAccountType: (type: AccountType) => Promise<void>;
  createSecondaryProfile: (type: AccountType) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredActiveType(): AccountType | null {
  try {
    const v = localStorage.getItem(ACTIVE_TYPE_KEY);
    return v === 'client' || v === 'company' ? v : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeAccountType, setActiveAccountType] = useState<AccountType | null>(readStoredActiveType());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const syncRequestRef = useRef(0);

  const resetUserState = useCallback(() => {
    setProfiles([]);
    setIsAdmin(false);
  }, []);

  const loadProfiles = useCallback(async (authUser: User): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id);
    if (error) throw error;
    return (data ?? []) as Profile[];
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

    const [profilesResult, adminResult] = await Promise.allSettled([
      loadProfiles(nextSession.user),
      checkAdmin(nextSession.user.id),
    ]);

    if (requestId !== syncRequestRef.current) return;

    if (profilesResult.status === 'fulfilled') {
      const list = profilesResult.value;
      setProfiles(list);
      // Escolhe perfil ativo: preserva escolha do usuário se existir; senão prioriza client.
      const stored = readStoredActiveType();
      const pick: AccountType | null =
        (stored && list.some(p => p.account_type === stored)) ? stored :
        (list.find(p => p.account_type === 'client')?.account_type as AccountType) ??
        (list[0]?.account_type as AccountType) ?? null;
      setActiveAccountType(pick);
      if (pick) { try { localStorage.setItem(ACTIVE_TYPE_KEY, pick); } catch {} }
    } else {
      console.error('Profile sync error:', profilesResult.reason);
      setProfiles([]);
    }

    if (adminResult.status === 'fulfilled') {
      setIsAdmin(adminResult.value);
    } else {
      console.error('Admin check error:', adminResult.reason);
      setIsAdmin(false);
    }

    setIsLoading(false);
  }, [checkAdmin, loadProfiles, resetUserState]);

  const refreshProfile = async () => {
    if (user) {
      const list = await loadProfiles(user);
      setProfiles(list);
    }
  };

  const switchAccountType = async (type: AccountType) => {
    if (!profiles.some(p => p.account_type === type)) {
      throw new Error('Perfil inexistente para este tipo de conta');
    }
    setActiveAccountType(type);
    try { localStorage.setItem(ACTIVE_TYPE_KEY, type); } catch {}
  };

  const createSecondaryProfile = async (type: AccountType): Promise<Profile> => {
    const { data, error } = await supabase.rpc('create_secondary_profile', { _account_type: type });
    if (error) throw error;
    if (user) {
      const list = await loadProfiles(user);
      setProfiles(list);
    }
    setActiveAccountType(type);
    try { localStorage.setItem(ACTIVE_TYPE_KEY, type); } catch {}
    return data as unknown as Profile;
  };

  useEffect(() => {
    let mounted = true;
    let loadingFallbackId: number | null = null;
    let lastUserId: string | null = null;

    try {
      const storageKeys = Object.keys(localStorage);
      for (const key of storageKeys) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const value = localStorage.getItem(key);
          if (value) {
            try { JSON.parse(value); } catch {
              console.warn('Removing corrupted auth token from localStorage');
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      console.warn('localStorage cleanup error:', e);
    }

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!mounted) return;
          const nextUserId = nextSession?.user?.id ?? null;
          if (
            nextUserId === lastUserId &&
            _event !== 'INITIAL_SESSION' &&
            _event !== 'SIGNED_IN' &&
            _event !== 'SIGNED_OUT'
          ) {
            setSession(nextSession);
            return;
          }
          lastUserId = nextUserId;
          void syncAuthState(nextSession);
        }
      );

      loadingFallbackId = window.setTimeout(() => {
        if (mounted) {
          console.warn('Auth bootstrap fallback activated');
          setIsLoading(false);
        }
      }, 8000);

      return () => {
        mounted = false;
        subscription.unsubscribe();
        if (loadingFallbackId) window.clearTimeout(loadingFallbackId);
      };
    } catch (err) {
      console.error('Auth state change error:', err);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      if (loadingFallbackId) window.clearTimeout(loadingFallbackId);
    };
  }, [resetUserState, syncAuthState]);

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
    if (error) throw error;
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfiles([]);
    setIsAdmin(false);
    try { localStorage.removeItem(ACTIVE_TYPE_KEY); } catch {}
  };

  const activeProfile =
    (activeAccountType && profiles.find(p => p.account_type === activeAccountType)) ||
    profiles[0] ||
    null;

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile: activeProfile,
      profiles,
      activeAccountType,
      hasClientProfile: profiles.some(p => p.account_type === 'client'),
      hasCompanyProfile: profiles.some(p => p.account_type === 'company'),
      isLoading,
      isAdmin,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      refreshProfile,
      switchAccountType,
      createSecondaryProfile,
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
