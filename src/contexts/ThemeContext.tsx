import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type AssociateTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: AssociateTheme;
  setTheme: (t: AssociateTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function storageKey(userId: string | undefined | null, accountType: string | null | undefined) {
  return `rarques.theme.${userId ?? 'anon'}.${accountType ?? 'default'}`;
}

function readStored(userId: string | undefined | null, accountType: string | null | undefined): AssociateTheme {
  try {
    const v = localStorage.getItem(storageKey(userId, accountType));
    return v === 'light' ? 'light' : 'dark';
  } catch { return 'dark'; }
}

/**
 * Provider de tema exclusivo da Área do Associado (Cliente e Empresa).
 * Não afeta Área Pública nem Painel ADM: só aplica atributo enquanto montado.
 */
export function AssociateThemeProvider({ children }: { children: ReactNode }) {
  const { user, activeAccountType } = useAuth();
  const [theme, setThemeState] = useState<AssociateTheme>(() => readStored(user?.id, activeAccountType));

  // Rehidrata ao trocar perfil ativo / usuário
  useEffect(() => {
    setThemeState(readStored(user?.id, activeAccountType));
  }, [user?.id, activeAccountType]);

  // Aplica atributo no <body> enquanto montado
  useEffect(() => {
    const body = document.body;
    body.setAttribute('data-associate-theme', theme);
    return () => {
      body.removeAttribute('data-associate-theme');
    };
  }, [theme]);

  const setTheme = useCallback((t: AssociateTheme) => {
    setThemeState(t);
    try { localStorage.setItem(storageKey(user?.id, activeAccountType), t); } catch {}
  }, [user?.id, activeAccountType]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAssociateTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAssociateTheme must be used within AssociateThemeProvider');
  return ctx;
}
