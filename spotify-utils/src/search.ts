import axios from 'axios';
import { SpotifyAuth } from './auth';
import { SpotifySearchParams, SpotifySearchResponse } from './types';

export class SpotifySearch {
  private auth: SpotifyAuth;

  constructor(auth: SpotifyAuth) {
    this.auth = auth;
  }

  /**
   * Search for items on Spotify
   * @param params Search parameters
   * @returns Search results
   */
  async search(params: SpotifySearchParams): Promise<SpotifySearchResponse> {
    try {
      const token = await this.auth.getValidToken();
      
      const searchParams = new URLSearchParams({
        q: params.q,
        type: params.type,
      });

      if (params.market) {
        searchParams.append('market', params.market);
      }

      if (params.limit) {
        searchParams.append('limit', params.limit.toString());
      }

      if (params.offset) {
        searchParams.append('offset', params.offset.toString());
      }

      if (params.include_external) {
        searchParams.append('include_external', params.include_external);
      }

      // Enable debugging in the browser console to help identify issues
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[SpotifySearch] Searching for ${params.type}s with query: ${params.q}`);
        console.debug(`[SpotifySearch] Full URL: https://api.spotify.com/v1/search?${searchParams.toString()}`);
      }

      try {
        const response = await axios.get<SpotifySearchResponse>(
          `https://api.spotify.com/v1/search?${searchParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[SpotifySearch] Search successful, found ${response.data[`${params.type}s`]?.total || 0} results`);
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            console.error(`[SpotifySearch] 403 Forbidden error when searching for ${params.type}s. This might be due to authorization scope limitations.`);
            console.error('[SpotifySearch] Try using the Authorization Code flow instead of Client Credentials for broader access.');
            
            // Rethrow with more context
            throw new Error(`Access forbidden (403) when searching for ${params.type}s. Your current authentication method may not have permission for this type of search.`);
          }
          
          // Log other status code errors
          if (error.response) {
            console.error(`[SpotifySearch] API error (${error.response.status}):`, error.response.data);
          } else {
            console.error('[SpotifySearch] Network error:', error.message);
          }
        }
        
        throw error;
      }
    } catch (error) {
      // Handle token retrieval errors
      console.error('[SpotifySearch] Error during search operation:', error);
      throw error;
    }
  }
} 