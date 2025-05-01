# JukeBlox

A Spotify-powered music exploration application with a beautiful, responsive UI.

## Project Structure

This repository contains two main components:

- **spotify-utils/**: A lightweight TypeScript wrapper around the Spotify Web API
  - Authentication (Auth Code and Client Credentials flows)
  - Search functionality
  - Token management and refresh
  
- **ui/**: A React-based user interface
  - Modern Spotify-inspired design
  - Routing and navigation
  - Authentication flow
  - Search interface with responsive results

## Quick Start

For detailed setup instructions, see the README in each subdirectory:
- [UI Setup Instructions](ui/README.md)
- [Spotify Utils Documentation](spotify-utils/README.md)

### Basic Setup

1. **Create a Spotify Developer App**
   - Register at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new application
   - Set the redirect URI to `http://localhost:8888/callback`
   - Note your Client ID and Client Secret

2. **Configure Environment**
   - Create `.env` files in both the `ui/` and `spotify-utils/` directories
   - Add your Spotify credentials (see subdirectory READMEs for details)

3. **Install Dependencies and Run**
   ```bash
   # Set up Spotify Utils
   cd spotify-utils
   npm install
   npm run build
   
   # Set up and run UI
   cd ../ui
   npm install
   npm run dev
   ```

4. Open your browser to http://localhost:8888

## Features

- **Authentication**: Login with Spotify or use Client Credentials
- **Search**: Find artists, albums, tracks, and playlists
- **Responsive Design**: Works on desktop and mobile devices
- **Persistent Sessions**: Stay logged in between page refreshes

## TODO
- Add more Spotify API endpoints
- Improve UI
- Add music playback functionality