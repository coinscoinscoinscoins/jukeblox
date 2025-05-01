# JukeBlox UI

A sleek, Spotify-inspired music exploration interface built with React, TypeScript, and Material UI.

## Project Overview

JukeBlox UI provides an intuitive interface for browsing and searching Spotify's vast music library. With a design inspired by Spotify's own aesthetic, it offers a familiar and comfortable experience for music lovers.

Key features:
- Modern, responsive UI with Spotify design language
- Authentication with Spotify via OAuth
- Music search with nice visual displays
- Clean, type-safe implementation

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Spotify Developer account

### Step 1: Create a Spotify Developer Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the required information:
   - App name: "JukeBlox" (or whatever you prefer)
   - App description: "Music exploration app"
   - Redirect URI: `http://localhost:8888/callback`
5. After creating the app, note your Client ID and Client Secret

### Step 2: Configure Environment Variables

1. In the `ui` directory, create a file named `.env`:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
   ```
   Replace `your_client_id_here` and `your_client_secret_here` with the values from your Spotify Developer Dashboard.

### Step 3: Install Dependencies

In the `ui` directory, run:

```bash
npm install
```

### Step 4: Set Up the Spotify Utils Library

The UI depends on the spotify-utils library in the parent directory. Set it up:

```bash
cd ../spotify-utils
npm install
npm run build
cd ../ui
```

### Step 5: Start the Development Server

Back in the `ui` directory, run:

```bash
npm run dev
```

The application will be available at http://localhost:8888.

### Step 6: Use the Application

1. Visit http://localhost:8888 in your browser
2. Click "Login with Spotify" to authenticate
3. After successful authentication, you'll be redirected to the search page
4. Search for your favorite artists, albums, tracks, or playlists

### Troubleshooting

If you encounter authentication issues:
- Ensure your Client ID and Client Secret are correctly copied
- Verify the Redirect URI in your Spotify Developer Dashboard matches exactly: `http://localhost:8888/callback`
- Check browser console for specific error messages

If you see "Invalid Client" errors:
- Make sure your environment variables are loaded correctly
- Try restarting the development server

## Development Notes

- The app uses Vite for fast development and optimized builds
- Authentication state is stored in session storage for persistence across page refreshes
- The application follows Spotify's design language with a dark theme

## Known Issues

### Search Type Restrictions with Client Credentials

When using the "Use Client Credentials" authentication method (instead of logging in with a Spotify account), you might encounter 403 Forbidden errors when searching for certain content types:

- The Spotify Web API applies different permissions based on your authentication method
- Client Credentials authentication has limited access to certain endpoints
- If you encounter a 403 error while searching for tracks, try switching to artists, albums, or playlists
- For full access to all search types, use the "Login with Spotify" option instead

### Search Not Working

If your search isn't working (no network requests being made):

1. Check your authentication status - you might need to log in again
2. Ensure your Spotify account is active and not region-restricted
3. Try clearing your browser cache and cookies
4. Check your console for specific error messages
5. Try a different search type (artist, album, etc.)

For developers: The app logs helpful debug information to the console when running in development mode.
