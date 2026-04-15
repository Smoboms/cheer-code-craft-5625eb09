import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    setProfile(data);
    return data;
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initSession = async () => {
      try {
        // Clear any corrupted localStorage data that might block session init
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

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!mounted) return;
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          await checkAdmin(session.user.id);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
            await checkAdmin(session.user.id);
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
          setIsLoading(false);
        }
      );
      subscription = data.subscription;
    } catch (err) {
      console.error('Auth state change error:', err);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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
