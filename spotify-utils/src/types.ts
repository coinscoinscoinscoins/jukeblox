export interface SpotifyAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface SpotifyAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
}

export interface SpotifySearchParams {
  q: string;
  type: 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode';
  market?: string;
  limit?: number;
  offset?: number;
  include_external?: 'audio';
}

export interface SpotifySearchResponse {
  albums?: SpotifyPagingObject;
  artists?: SpotifyPagingObject;
  playlists?: SpotifyPagingObject;
  tracks?: SpotifyPagingObject;
  shows?: SpotifyPagingObject;
  episodes?: SpotifyPagingObject;
}

export interface SpotifyPagingObject {
  href: string;
  items: any[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
} 