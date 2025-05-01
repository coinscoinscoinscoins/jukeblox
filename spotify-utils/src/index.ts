export * from './types';
export * from './auth';
export * from './search';

import { SpotifyAuth } from './auth';
import { SpotifySearch } from './search';

export class SpotifyClient {
  public auth: SpotifyAuth;
  public search: SpotifySearch;

  constructor(clientId: string, clientSecret: string, redirectUri?: string) {
    this.auth = new SpotifyAuth({
      clientId,
      clientSecret,
      redirectUri
    });
    this.search = new SpotifySearch(this.auth);
  }
}

// Usage example:
/*
const spotify = new SpotifyClient(
  'your-client-id',
  'your-client-secret',
  'your-redirect-uri'
);

// To get client credentials token (no user login required)
await spotify.auth.getClientCredentialsToken();

// To search for tracks
const searchResults = await spotify.search.search({
  q: 'artist:coldplay',
  type: 'track',
  limit: 10
});
*/ 