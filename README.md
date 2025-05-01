# JukeBlox

A Spotify-powered music application.

## Project Structure

- `spotify-utils/`: A utility wrapper around the Spotify Web API
  - Authentication (Auth Code and Client Credentials flows)
  - Search functionality
- `ui/`: React-based user interface

## Getting Started

### 1. Setup Spotify API Credentials

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Note your Client ID and Client Secret
4. Add `http://localhost:5173/callback` as a Redirect URI in your application settings

### 2. Setup Environment Variables

Create a `.env` file in the `ui` directory:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 3. Install Dependencies and Run

```bash
# Install UI dependencies
cd ui
npm install

# Install Spotify Utils dependencies
cd ../spotify-utils
npm install

# Build the Spotify Utils
npm run build

# Run the UI
cd ../ui
npm run dev
```

## Features

- Spotify Authentication
- Music Search
- More coming soon!

## TODO
- Add more Spotify API endpoints
- Improve UI
- Add music playback functionality