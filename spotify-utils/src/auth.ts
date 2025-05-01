import axios from 'axios';
import { SpotifyAuthConfig, SpotifyAuthTokenResponse } from './types';

/**
 * Convert a string to base64 encoding (browser-safe version)
 */
function toBase64(str: string): string {
  return btoa(str);
}

export class SpotifyAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri?: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshToken: string | null = null;

  constructor(config: SpotifyAuthConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  /**
   * Get the login URL for the Spotify authorization code flow
   * @param scopes Array of permission scopes to request
   * @param state Optional state parameter for security
   * @returns URL to redirect user to for authorization
   */
  getAuthorizationUrl(scopes: string[] = [], state?: string): string {
    const scopeString = scopes.join(' ');
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri || '',
      scope: scopeString,
    });

    if (state) {
      params.append('state', state);
    }

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange an authorization code for an access token
   * @param code The authorization code returned from the initial request
   * @returns Access token response
   */
  async getAccessTokenFromCode(code: string): Promise<SpotifyAuthTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri || '',
    });

    try {
      const response = await axios.post<SpotifyAuthTokenResponse>(
        'https://accounts.spotify.com/api/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + toBase64(`${this.clientId}:${this.clientSecret}`),
          },
        }
      );

      this.setTokenData(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an access token using client credentials flow (no user context)
   * @returns Access token response
   */
  async getClientCredentialsToken(): Promise<SpotifyAuthTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    });

    try {
      const response = await axios.post<SpotifyAuthTokenResponse>(
        'https://accounts.spotify.com/api/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + toBase64(`${this.clientId}:${this.clientSecret}`),
          },
        }
      );

      this.setTokenData(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh the access token using a refresh token
   * @returns New access token response
   */
  async refreshAccessToken(): Promise<SpotifyAuthTokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });

    try {
      const response = await axios.post<SpotifyAuthTokenResponse>(
        'https://accounts.spotify.com/api/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + toBase64(`${this.clientId}:${this.clientSecret}`),
          },
        }
      );

      this.setTokenData(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if the current token is valid, if not refresh it automatically
   * @returns The current valid access token
   */
  async getValidToken(): Promise<string> {
    const now = Date.now();
    
    // If token is expired or will expire in the next 60 seconds
    if (!this.accessToken || now >= this.tokenExpiresAt - 60000) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        await this.getClientCredentialsToken();
      }
    }
    
    return this.accessToken as string;
  }

  private setTokenData(tokenData: SpotifyAuthTokenResponse): void {
    this.accessToken = tokenData.access_token;
    this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
    
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token;
    }
  }
} 