import { useState, useEffect } from 'react';
import { SpotifyClient } from '../../../spotify-utils/src';
import { useNavigate } from 'react-router-dom';
import { SpotifyAuthConfig, StoredAuthData } from '../types';

interface SpotifyAuthOptions extends SpotifyAuthConfig {
  onAuthenticated?: (client: SpotifyClient) => void;
}

export function useSpotifyAuth({
  clientId,
  clientSecret,
  redirectUri,
  onAuthenticated
}: SpotifyAuthOptions) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(null);
  const navigate = useNavigate();

  // Initialize Spotify client
  useEffect(() => {
    const client = new SpotifyClient(clientId, clientSecret, redirectUri);
    setSpotifyClient(client);

    // Try to load auth data from session storage
    tryRestoreAuth(client);
  }, [clientId, clientSecret, redirectUri]);

  // Handle authentication code from URL
  useEffect(() => {
    if (!spotifyClient) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isAuthenticated && !isAuthenticating) {
      handleAuthCode(code);
    }
  }, [spotifyClient, isAuthenticated, isAuthenticating]);

  const tryRestoreAuth = async (client: SpotifyClient) => {
    const storedAuth = sessionStorage.getItem('spotify_auth_data');
    console.log('tryRestoreAuth - stored auth data exists:', !!storedAuth);
    if (!storedAuth) return;
    
    try {
      const authData: StoredAuthData = JSON.parse(storedAuth);
      const now = Date.now();
      
      console.log('Auth data from storage:', {
        accessTokenExists: !!authData.accessToken, 
        refreshTokenExists: !!authData.refreshToken,
        expiresAt: new Date(authData.expiresAt).toISOString(),
        isExpired: now >= authData.expiresAt - 60000
      });
      
      // If token is expired or will expire in the next 60 seconds
      if (now >= authData.expiresAt - 60000) {
        console.log('Token expired or expires soon, attempting refresh');
        // Try to refresh if we have a refresh token
        if (authData.refreshToken) {
          setIsAuthenticating(true);
          
          // Set the refresh token so the client can use it
          client.auth.setTokensFromStorage(
            authData.accessToken, 
            authData.expiresAt, 
            authData.refreshToken
          );
          
          console.log('Refreshing token using client...');
          try {
            // Use client to refresh the token
            const refreshResult = await client.auth.refreshAccessToken();
            console.log('Token refresh successful, new expiry:', new Date(Date.now() + refreshResult.expires_in * 1000).toISOString());
            
            // Update storage with refreshed token
            saveAuthToStorage(
              refreshResult.access_token,
              Date.now() + refreshResult.expires_in * 1000,
              refreshResult.refresh_token || authData.refreshToken
            );
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw refreshError;
          }
          
          setIsAuthenticated(true);
          if (onAuthenticated) {
            onAuthenticated(client);
          }
        } else {
          console.log('No refresh token available, cannot refresh');
          throw new Error('Token expired and no refresh token available');
        }
      } else {
        console.log('Token still valid, using existing token');
        // Token is still valid, set it on the client
        client.auth.setTokensFromStorage(
          authData.accessToken, 
          authData.expiresAt, 
          authData.refreshToken
        );
        
        // Notify that we're authenticated
        setIsAuthenticated(true);
        if (onAuthenticated) {
          onAuthenticated(client);
        }
      }
    } catch (error) {
      // If restore fails, we'll just require a new login
      console.error('Auth restore failed:', error);
      sessionStorage.removeItem('spotify_auth_data');
      console.warn('Failed to restore Spotify authentication session', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const saveAuthToStorage = (accessToken: string, expiresAt: number, refreshToken?: string) => {
    const authData: StoredAuthData = {
      accessToken,
      refreshToken,
      expiresAt
    };
    console.log('Saving auth data to storage:', {
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
      expiresAt: new Date(expiresAt).toISOString()
    });
    sessionStorage.setItem('spotify_auth_data', JSON.stringify(authData));
  };

  const handleAuthCode = async (code: string) => {
    if (!spotifyClient) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      console.log('Exchanging auth code for token...');
      const response = await spotifyClient.auth.getAccessTokenFromCode(code);
      console.log('Token exchange successful');
      
      // Calculate expiry time
      const expiresAt = Date.now() + response.expires_in * 1000;
      
      // Save auth data to session storage
      saveAuthToStorage(
        response.access_token,
        expiresAt,
        response.refresh_token
      );
      
      // Make sure client has the token data directly set
      console.log('Setting tokens on Spotify client');
      spotifyClient.auth.setTokensFromStorage(
        response.access_token,
        expiresAt,
        response.refresh_token
      );
      
      setIsAuthenticated(true);
      
      if (onAuthenticated) {
        console.log('Notifying parent component of successful authentication');
        onAuthenticated(spotifyClient);
      }
    } catch (err) {
      console.error('Authentication with code failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const login = () => {
    if (!spotifyClient) return;
    
    console.log('Initiating Spotify login flow...');
    
    // Define the scopes needed for your application
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    
    // Generate a random state string for security
    const state = Math.random().toString(36).substring(2, 15);
    console.log('Generated auth state:', state);
    
    // Store state in sessionStorage for verification when the user returns
    sessionStorage.setItem('spotify_auth_state', state);
    
    // Get the authorization URL and redirect the user
    const authUrl = spotifyClient.auth.getAuthorizationUrl(scopes, state);
    console.log('Redirecting to Spotify authorization URL');
    window.location.href = authUrl;
  };

  const logout = () => {
    // Clear auth data from session storage
    sessionStorage.removeItem('spotify_auth_data');
    setIsAuthenticated(false);
    
    // Redirect to home page
    navigate('/');
  };

  return {
    isAuthenticated,
    isAuthenticating,
    error,
    spotifyClient,
    login,
    logout
  };
} 