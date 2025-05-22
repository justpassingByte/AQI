import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our context
interface User {
  id: string;
  email: string;
  name?: string;
  school?: string;
  lastLogin: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user data from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('@user_data');
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // For now, we'll use a simple mock authentication
  // In a real app, you'd integrate with a backend or service like Firebase
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      if (email && password) {
        const newUser: User = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          school: 'Demo School',
          lastLogin: Date.now()
        };
        
        await AsyncStorage.setItem('@user_data', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      if (email && password) {
        const newUser: User = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email,
          name: name || email.split('@')[0],
          school: 'Demo School',
          lastLogin: Date.now()
        };
        
        await AsyncStorage.setItem('@user_data', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error('Invalid registration data');
      }
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
    } catch (e) {
      console.error('Failed to sign out:', e);
      throw e;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) {
      console.error('Failed to update profile:', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 