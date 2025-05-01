import { SpotifyClient } from '../../../spotify-utils/src';

// Auth types
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

export interface StoredAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Search types
export interface SpotifySearchParams {
  q: string;
  type: 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode';
  market?: string;
  limit?: number;
  offset?: number;
  include_external?: 'audio';
}

export interface SpotifySearchResponse {
  albums?: SpotifyPagingObject<SpotifyAlbum>;
  artists?: SpotifyPagingObject<SpotifyArtist>;
  playlists?: SpotifyPagingObject<SpotifyPlaylist>;
  tracks?: SpotifyPagingObject<SpotifyTrack>;
  shows?: SpotifyPagingObject<SpotifyShow>;
  episodes?: SpotifyPagingObject<SpotifyEpisode>;
}

export interface SpotifyPagingObject<T> {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

// Common types
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyFollowers {
  href: string | null;
  total: number;
}

// Core entity types
export interface SpotifyArtist {
  id: string;
  name: string;
  type: 'artist';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  followers?: SpotifyFollowers;
  genres?: string[];
  images?: SpotifyImage[];
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  type: 'album';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  album_type: 'album' | 'single' | 'compilation';
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  total_tracks: number;
  available_markets?: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  type: 'track';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  available_markets?: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  is_playable?: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  type: 'playlist';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  collaborative: boolean;
  description: string | null;
  images: SpotifyImage[];
  owner: SpotifyUser;
  public: boolean | null;
  tracks: {
    href: string;
    total: number;
  };
  followers?: SpotifyFollowers;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  type: 'user';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  followers?: SpotifyFollowers;
  images?: SpotifyImage[];
}

export interface SpotifyShow {
  id: string;
  name: string;
  type: 'show';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  description: string;
  images: SpotifyImage[];
  publisher: string;
  media_type: string;
  languages: string[];
  total_episodes: number;
}

export interface SpotifyEpisode {
  id: string;
  name: string;
  type: 'episode';
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
  description: string;
  images: SpotifyImage[];
  duration_ms: number;
  language: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
}

// Type for props
export interface SpotifyAuthProps {
  onAuthenticated?: (client: SpotifyClient) => void;
} 