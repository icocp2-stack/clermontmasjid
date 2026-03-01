import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserRole {
  isAdmin: boolean;
  canManagePosts: boolean;
  canManageVideos: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>({ isAdmin: false, canManagePosts: false, canManageVideos: false });
  const [loading, setLoading] = useState(true);

  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopment) {
      setRole({ isAdmin: true, canManagePosts: true, canManageVideos: true });
      setUser({ id: 'dev-admin', email: 'dev@admin.local' } as User);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user);
      } else {
        setRole({ isAdmin: false, canManagePosts: false, canManageVideos: false });
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDevelopment]);

  const checkUserRole = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('is_admin, can_manage_posts, can_manage_videos')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error);
        setRole({ isAdmin: false, canManagePosts: false, canManageVideos: false });
      } else if (data) {
        setRole({
          isAdmin: data.is_admin || false,
          canManagePosts: data.can_manage_posts || false,
          canManageVideos: data.can_manage_videos || false
        });
      } else {
        setRole({ isAdmin: false, canManagePosts: false, canManageVideos: false });
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setRole({ isAdmin: false, canManagePosts: false, canManageVideos: false });
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signInWithEmail, signUpWithEmail, signOut }}>
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
