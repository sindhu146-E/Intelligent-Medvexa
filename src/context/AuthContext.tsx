import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { 
  getSupabase, 
  getConnectionStatus, 
  getLocalProfile, 
  saveLocalProfile, 
  saveCustomSupabaseConfig,
  SupabaseConnectionStatus 
} from '../lib/supabase';

interface AuthContextType {
  profile: Profile;
  role: UserRole;
  isPharmacist: boolean;
  isDoctor: boolean;
  connectionStatus: SupabaseConnectionStatus;
  isAuthModalOpen: boolean;
  isConnectModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  switchRole: (role: UserRole) => void;
  updateProfileDetails: (updates: Partial<Profile>) => void;
  connectSupabaseCredentials: (url: string, key: string) => void;
  disconnectSupabase: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(getLocalProfile());
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus>(getConnectionStatus());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    // Check Supabase Auth state if client is active
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setProfile(data as Profile);
              }
            });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setProfile(data as Profile);
              }
            });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [connectionStatus.isConnected]);

  const switchRole = (newRole: UserRole) => {
    const updated = {
      ...profile,
      role: newRole,
      full_name: newRole === 'pharmacist' 
        ? 'Dr. Priya Varma, PharmD' 
        : newRole === 'doctor' 
        ? 'Dr. R. Arvind, MBBS, MD' 
        : 'Kavitha Sundaram (Patient)',
      license_number: newRole === 'pharmacist' ? 'RPH-849204-TN' : newRole === 'doctor' ? 'MCI-73910' : undefined
    };
    setProfile(updated);
    saveLocalProfile(updated);
  };

  const updateProfileDetails = (updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveLocalProfile(updated);
  };

  const connectSupabaseCredentials = (url: string, key: string) => {
    saveCustomSupabaseConfig(url, key);
    setConnectionStatus(getConnectionStatus());
    setIsConnectModalOpen(false);
  };

  const disconnectSupabase = () => {
    saveCustomSupabaseConfig('', '');
    setConnectionStatus(getConnectionStatus());
  };

  const logout = () => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    const defaultProf = getLocalProfile();
    setProfile(defaultProf);
    saveLocalProfile(defaultProf);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        role: profile.role,
        isPharmacist: profile.role === 'pharmacist',
        isDoctor: profile.role === 'doctor',
        connectionStatus,
        isAuthModalOpen,
        isConnectModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openConnectModal: () => setIsConnectModalOpen(true),
        closeConnectModal: () => setIsConnectModalOpen(false),
        switchRole,
        updateProfileDetails,
        connectSupabaseCredentials,
        disconnectSupabase,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
