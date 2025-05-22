import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Đăng ký WebBrowser để xử lý authentication redirects
WebBrowser.maybeCompleteAuthSession();

// Config từ app.json
const webClientId = Constants.expoConfig?.web?.config?.googleClientId || '';
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'aqi-app'
});

// Log detailed information 
console.log('====== AUTH DEBUG INFO ======');
console.log('Redirect URI:', redirectUri);
console.log('Web Client ID:', webClientId);
console.log('Expo Constants:', JSON.stringify(Constants.expoConfig, null, 2));
console.log('Platform:', Platform.OS);
console.log('============================');

// Config cho Google Auth
const googleConfig = {
  expoClientId: webClientId,
  iosClientId: '551744406587-sen1rde1uueg0s0t36ligme6efu1iv9f.apps.googleusercontent.com',
  androidClientId: 'ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com', // Thêm sau
  webClientId: webClientId,
  scopes: ['profile', 'email'],
};

// For web specific configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// UserProfile interface
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  photo?: string;
  school?: string;
  lastLogin: number;
}

// Define types for our context
interface User extends UserProfile {
  // Giữ để tương thích ngược
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: googleConfig.iosClientId,
        android: googleConfig.androidClientId,
        web: googleConfig.webClientId
      }) || '',
      redirectUri,
      scopes: googleConfig.scopes,
      responseType: 'token',
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

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

  // Handle manual web auth redirects
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if we have access token in the URL hash
      const handleHashRedirect = async () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
          console.log('Found hash in URL:', hash);
          
          // Parse the hash to get access token
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            console.log('Found access token in URL hash');
            setIsLoading(true);
            
            try {
              // Fetch user info with the token
              const userInfoResponse = await fetch(
                'https://www.googleapis.com/userinfo/v2/me',
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              
              if (!userInfoResponse.ok) {
                throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
              }
              
              const userInfo = await userInfoResponse.json();
              console.log('User info received from hash redirect:', userInfo);
              
              const newUser: User = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                photo: userInfo.picture,
                lastLogin: Date.now()
              };
              
              await AsyncStorage.setItem('@user_data', JSON.stringify(newUser));
              setUser(newUser);
              
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
              console.error('Error handling hash redirect:', error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      };
      
      handleHashRedirect();
    }
  }, []);

  // Handle Google Auth response
  useEffect(() => {
    const handleGoogleResponse = async () => {
      console.log('Google Auth Response:', response);
      if (response?.type === 'success') {
        setIsLoading(true);
        const { authentication } = response;
        
        if (!authentication) {
          console.log('Authentication missing from response');
          setIsLoading(false);
          return;
        }
        
        console.log('Authentication token received:', authentication.accessToken.substring(0, 10) + '...');
        
        // Lấy thông tin user từ access token
        try {
          console.log('Fetching user info from Google API...');
          
          // On web, we might need to handle CORS issues
          const headers = { Authorization: `Bearer ${authentication.accessToken}` };
          
          const userInfoResponse = await fetch(
            'https://www.googleapis.com/userinfo/v2/me',
            { headers }
          );
          
          if (!userInfoResponse.ok) {
            throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
          }
          
          const userInfo = await userInfoResponse.json();
          console.log('User info received:', {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            photo: userInfo.picture ? 'received' : 'missing',
          });
          
          const newUser: User = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            photo: userInfo.picture,
            lastLogin: Date.now()
          };
          
          await AsyncStorage.setItem('@user_data', JSON.stringify(newUser));
          console.log('User data saved to AsyncStorage');
          setUser(newUser);
        } catch (error) {
          console.error('Error fetching user info:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error('Google Auth Error:', response.error);
      }
    };
    
    if (response?.type) {
      handleGoogleResponse();
    }
  }, [response]);

  // For now, we'll use a simple mock authentication
  // In a real app, you'd integrate with a backend or service like Firebase
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting email/password login:', { email });
    
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
        console.log('Login successful, user data saved');
        setUser(newUser);
      } else {
        console.error('Invalid credentials');
        throw new Error('Invalid credentials');
      }
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    console.log('Google Sign In Config:', {
      clientId: Platform.select({
        ios: googleConfig.iosClientId,
        android: googleConfig.androidClientId,
        web: googleConfig.webClientId
      }),
      redirectUri,
      scopes: googleConfig.scopes
    });
    console.log('Starting Google Sign In prompt...');
    
    try {
      if (Platform.OS === 'web') {
        // Try direct URL construction for web
        console.log('Using direct URL approach for web');
        
        // Generate a state parameter for security
        const state = Math.random().toString(36).substring(2, 15);
        
        // Construct Google OAuth URL manually
        const clientId = googleConfig.webClientId;
        const scope = encodeURIComponent(googleConfig.scopes.join(' '));
        const directRedirectUri = encodeURIComponent(redirectUri);
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${directRedirectUri}&response_type=token&scope=${scope}&state=${state}&prompt=select_account`;
        
        console.log('Direct auth URL:', googleAuthUrl);
        
        // Open in a new tab
        window.open(googleAuthUrl, '_blank');
      } else if (!request) {
        console.error('Google Auth Request not ready');
        throw new Error('Google Auth Request not ready');
      } else {
        // Native platforms use the standard flow
        const result = await promptAsync();
        console.log('Prompt result:', result);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    console.log('Attempting registration:', { email, name });
    
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
        console.log('Registration successful, user data saved');
        setUser(newUser);
      } else {
        console.error('Invalid registration data');
        throw new Error('Invalid registration data');
      }
    } catch (e) {
      console.error('Registration error:', e);
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
        signInWithGoogle,
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