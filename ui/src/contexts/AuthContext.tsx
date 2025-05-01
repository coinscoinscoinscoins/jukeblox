import React, { createContext, useContext, ReactNode } from 'react';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { SpotifyClient } from '../../../spotify-utils/src';
import { Navigate, useLocation } from 'react-router-dom';
import { SpotifyAuthConfig } from '../types';

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  spotifyClient: SpotifyClient | null;
  login: () => void;
  logout: () => void;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps extends SpotifyAuthConfig {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider = ({ 
  children, 
  clientId, 
  clientSecret, 
  redirectUri 
}: AuthProviderProps) => {
  const { 
    isAuthenticated, 
    isAuthenticating, 
    error, 
    spotifyClient, 
    login, 
    logout 
  } = useSpotifyAuth({
    clientId,
    clientSecret,
    redirectUri,
    onAuthenticated: (client) => {
      console.log('Client authenticated through context provider', client);
    }
  });

  const contextValue: AuthContextType = {
    isAuthenticated,
    isAuthenticating,
    error,
    spotifyClient,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the login page with the return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 