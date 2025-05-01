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

    const response = await axios.get<SpotifySearchResponse>(
      `https://api.spotify.com/v1/search?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
} 