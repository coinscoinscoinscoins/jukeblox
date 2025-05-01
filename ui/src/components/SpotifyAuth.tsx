import { useState, useEffect } from 'react';
import { SpotifyClient } from '../../../spotify-utils/src';

interface SpotifyAuthProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  onAuthenticated?: (client: SpotifyClient) => void;
}

interface StoredAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export function SpotifyAuth({ 
  clientId, 
  clientSecret, 
  redirectUri, 
  onAuthenticated 
}: SpotifyAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(null);

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
    if (!storedAuth) return;
    
    try {
      const authData: StoredAuthData = JSON.parse(storedAuth);
      const now = Date.now();
      
      // If token is expired or will expire in the next 60 seconds
      if (now >= authData.expiresAt - 60000) {
        // Try to refresh if we have a refresh token
        if (authData.refreshToken) {
          setIsAuthenticating(true);
          await client.auth.refreshAccessToken();
          setIsAuthenticated(true);
          if (onAuthenticated) {
            onAuthenticated(client);
          }
        }
      } else {
        // Token is still valid, notify that we're authenticated
        setIsAuthenticated(true);
        if (onAuthenticated) {
          onAuthenticated(client);
        }
      }
    } catch (error) {
      // If restore fails, we'll just require a new login
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
    sessionStorage.setItem('spotify_auth_data', JSON.stringify(authData));
  };

  const handleAuthCode = async (code: string) => {
    if (!spotifyClient) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const response = await spotifyClient.auth.getAccessTokenFromCode(code);
      
      // Save auth data to session storage
      saveAuthToStorage(
        response.access_token,
        Date.now() + response.expires_in * 1000,
        response.refresh_token
      );
      
      setIsAuthenticated(true);
      
      if (onAuthenticated) {
        onAuthenticated(spotifyClient);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleLogin = () => {
    if (!spotifyClient) return;
    
    // Define the scopes needed for your application
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    
    // Generate a random state string for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in sessionStorage for verification when the user returns
    sessionStorage.setItem('spotify_auth_state', state);
    
    // Get the authorization URL and redirect the user
    const authUrl = spotifyClient.auth.getAuthorizationUrl(scopes, state);
    window.location.href = authUrl;
  };

  const handleClientCredentialsAuth = async () => {
    if (!spotifyClient) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const response = await spotifyClient.auth.getClientCredentialsToken();
      
      // Save auth data to session storage (no refresh token with client credentials)
      saveAuthToStorage(
        response.access_token,
        Date.now() + response.expires_in * 1000
      );
      
      setIsAuthenticated(true);
      
      if (onAuthenticated) {
        onAuthenticated(spotifyClient);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="spotify-auth">
      <h2>Spotify Authentication</h2>
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="auth-buttons">
          <button 
            onClick={handleLogin}
            disabled={isAuthenticating || !spotifyClient}
            className="login-button"
          >
            {isAuthenticating ? 'Authenticating...' : 'Login with Spotify'}
          </button>
          
          <button 
            onClick={handleClientCredentialsAuth}
            disabled={isAuthenticating || !spotifyClient}
            className="client-auth-button"
          >
            {isAuthenticating ? 'Authenticating...' : 'Use Client Credentials'}
          </button>
        </div>
      ) : (
        <div className="auth-success">
          <p>Successfully authenticated with Spotify!</p>
        </div>
      )}
    </div>
  );
} 