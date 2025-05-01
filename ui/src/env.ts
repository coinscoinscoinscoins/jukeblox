/**
 * Environment variables utility
 * 
 * This module provides a way to access environment variables with fallbacks
 * and debug information. Use this if you're having trouble with .env files.
 */

interface SpotifyEnv {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Get environment variables for Spotify API
 * You can pass in your own values if the environment variables aren't working
 */
export function getSpotifyEnv(override?: Partial<SpotifyEnv>): SpotifyEnv {
  const env = {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID as string || override?.clientId || '',
    clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string || override?.clientSecret || '',
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string || override?.redirectUri || 'http://localhost:8888/callback'
  };

  // Log environment variables
  console.log('Loading Spotify environment variables:');
  console.log('- Client ID:', env.clientId ? `${env.clientId.substring(0, 4)}...${env.clientId.substring(env.clientId.length - 4)}` : '[MISSING]');
  console.log('- Client Secret:', env.clientSecret ? '[PRESENT]' : '[MISSING]');
  console.log('- Redirect URI:', env.redirectUri);

  return env;
} 