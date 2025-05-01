# Spotify Utils

A utility wrapper around the Spotify Web API.

## Features

- Authentication with Spotify API (Authorization Code Flow and Client Credentials Flow)
- Search functionality for tracks, artists, albums, and playlists
- Automatic token refreshing

## Installation

```bash
npm install
```

## Usage

### Basic Authentication

```typescript
import { SpotifyClient } from 'spotify-utils';

// Create a new Spotify client
const spotify = new SpotifyClient(
  'your-client-id',
  'your-client-secret',
  'your-redirect-uri'  // Optional, only needed for authorization code flow
);

// Using client credentials flow (no user authorization)
await spotify.auth.getClientCredentialsToken();

// Using authorization code flow
// 1. Generate an authorization URL
const scopes = ['user-read-private', 'user-read-email'];
const authUrl = spotify.auth.getAuthorizationUrl(scopes);

// 2. Redirect the user to the authUrl

// 3. After the user authorizes your app, Spotify will redirect to your redirect_uri
// with a 'code' parameter. Use this code to get an access token:
const code = 'authorization-code-from-redirect';
await spotify.auth.getAccessTokenFromCode(code);
```

### Searching

```typescript
// Search for tracks
const trackResults = await spotify.search.search({
  q: 'artist:coldplay track:yellow',
  type: 'track',
  limit: 10
});

// Search for artists
const artistResults = await spotify.search.search({
  q: 'coldplay',
  type: 'artist'
});

// Search for albums
const albumResults = await spotify.search.search({
  q: 'parachutes',
  type: 'album'
});
```

## Development

1. Build the project:

```bash
npm run build
```

## License

MIT 