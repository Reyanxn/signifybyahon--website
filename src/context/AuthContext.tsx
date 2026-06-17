'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { createUserProfile, getUserProfile } from '@/lib/supabaseServices';

interface AuthUser {
  uid: string;
  email: string | null | undefined;
  displayName: string | null;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => {}, register: async () => {}, logout: async () => {}, refresh: async () => {},
});

async function buildUser(sessionUserId: string): Promise<AuthUser | null> {
  const fbUser = (await supabase.auth.getUser()).data.user;
  if (!fbUser) return null;
  const profile = await getUserProfile(sessionUserId);
  return {
    uid: sessionUserId,
    email: fbUser.email,
    displayName: fbUser.user_metadata?.display_name || profile?.displayName || '',
    role: profile?.role || 'customer',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildUser(session.user.id).then((u) => { setUser(u); setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = await buildUser(session.user.id);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const s = await supabase.auth.getSession();
    if (s.data.session?.user) {
      const u = await buildUser(s.data.session.user.id);
      setUser(u);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
