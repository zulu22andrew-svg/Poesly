import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserPlan } from '../types';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  creator_pro: {
    id: 'demo-david-vance',
    name: 'David Vance',
    email: 'david.vance@posely.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=85',
    plan: 'creator_pro',
    role: 'Editorial & Portrait Photographer',
    studioName: 'Vance Visuals Studio',
    creditsRemaining: 850,
    monthlyAllotment: 1000,
    shootsCompleted: 34,
    isDemoAccount: true,
    joinedDate: 'March 2024',
    bio: 'Directing portrait and fashion shoots with real-time AI computer vision guidance.',
  },
  studio_team: {
    id: 'demo-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@fashionlab.studio',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=85',
    plan: 'studio_team',
    role: 'Commercial Studio Director',
    studioName: 'FashionLab Commercial Studio',
    creditsRemaining: 3420,
    monthlyAllotment: 5000,
    shootsCompleted: 128,
    isDemoAccount: true,
    joinedDate: 'January 2024',
    bio: 'Lead commercial photographer managing client iPad mirror stations and batch runway ingestion.',
  },
  starter: {
    id: 'demo-alex-rivera',
    name: 'Alex Rivera',
    email: 'alex.rivera@creative.io',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=85',
    plan: 'starter',
    role: 'Content Creator & Street Shooter',
    studioName: 'Alex Rivera Creatives',
    creditsRemaining: 50,
    monthlyAllotment: 100,
    shootsCompleted: 6,
    isDemoAccount: true,
    joinedDate: 'September 2024',
    bio: 'Self-shooting lifestyle portraits and dynamic street walking series.',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'demo';
  targetPlanForSignup: UserPlan | null;
  openAuthModal: (tab?: 'login' | 'signup' | 'demo', plan?: UserPlan) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password?: string; plan?: UserPlan; studioName?: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithDemo: (profileKey?: 'creator_pro' | 'studio_team' | 'starter') => void;
  logout: () => void;
  switchDemoAccount: (profileKey: 'creator_pro' | 'studio_team' | 'starter') => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'posely_auth_user_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with persisted user or default to the standard demo account (Creator Pro David Vance)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default to instant demo account so user can immediately test
    return DEMO_PROFILES.creator_pro;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'demo'>('login');
  const [targetPlanForSignup, setTargetPlanForSignup] = useState<UserPlan | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const openAuthModal = (tab: 'login' | 'signup' | 'demo' = 'login', plan?: UserPlan) => {
    setAuthModalTab(tab);
    if (plan) setTargetPlanForSignup(plan);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setTargetPlanForSignup(null);
  };

  const loginWithDemo = (profileKey: 'creator_pro' | 'studio_team' | 'starter' = 'creator_pro') => {
    const demoProfile = DEMO_PROFILES[profileKey] || DEMO_PROFILES.creator_pro;
    setUser(demoProfile);
    setIsAuthModalOpen(false);
  };

  const switchDemoAccount = (profileKey: 'creator_pro' | 'studio_team' | 'starter') => {
    const demoProfile = DEMO_PROFILES[profileKey];
    if (demoProfile) {
      setUser(demoProfile);
    }
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    // Check if user is logging into a recognized demo account or custom account
    const cleanEmail = email.trim().toLowerCase();
    
    // Check demo accounts
    for (const key of Object.keys(DEMO_PROFILES)) {
      if (DEMO_PROFILES[key].email.toLowerCase() === cleanEmail) {
        setUser(DEMO_PROFILES[key]);
        setIsAuthModalOpen(false);
        return { success: true };
      }
    }

    // Otherwise create or log in standard user profile
    const nameFromEmail = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = nameFromEmail
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ') || 'Studio Creator';

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      plan: 'creator_pro',
      role: 'Photographer',
      creditsRemaining: 250,
      shootsCompleted: 1,
      isDemoAccount: false,
      joinedDate: 'Today',
      bio: 'Posely Studio Creator',
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password?: string;
    plan?: UserPlan;
    studioName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const plan = data.plan || targetPlanForSignup || 'creator_pro';
    const credits = plan === 'studio_team' ? 2500 : plan === 'creator_pro' ? 750 : 50;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: data.name.trim() || 'New Photographer',
      email: data.email.trim().toLowerCase(),
      avatarUrl: `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80`,
      plan,
      role: plan === 'studio_team' ? 'Studio Agency Owner' : 'Portrait Creator',
      studioName: data.studioName || `${data.name.trim()}'s Studio`,
      creditsRemaining: credits,
      shootsCompleted: 0,
      isDemoAccount: false,
      joinedDate: 'Today',
      bio: 'Exploring computer vision AI posing & directorial tools.',
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    setTargetPlanForSignup(null);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isDemo: !!user?.isDemoAccount,
        isAuthModalOpen,
        authModalTab,
        targetPlanForSignup,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        loginWithDemo,
        logout,
        switchDemoAccount,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
