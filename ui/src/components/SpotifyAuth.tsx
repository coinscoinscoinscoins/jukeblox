import { useAuth } from '../contexts/AuthContext';

export function SpotifyAuth() {
  const { isAuthenticated, isAuthenticating, error, login } = useAuth();

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
            onClick={login}
            disabled={isAuthenticating}
            className="login-button"
          >
            {isAuthenticating ? 'Authenticating...' : 'Login with Spotify'}
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