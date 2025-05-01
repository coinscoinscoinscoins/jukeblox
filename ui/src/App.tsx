import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { SpotifyClient } from '../../spotify-utils/src'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import Navbar from './components/Navbar'
import { createTheme, ThemeProvider } from '@mui/material/styles'

// Spotify inspired theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1DB954', // Spotify green
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#191414', // Spotify black
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
  typography: {
    fontFamily: '"Circular", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 500, // Spotify uses very rounded buttons
          padding: '12px 24px',
        },
      },
    },
  },
});

function App() {
  const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Get environment variables (with fallbacks)
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string 
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string || 'http://localhost:8888/callback'

  // Check if we have stored auth data
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('spotify_auth_data')
    if (storedAuth) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthenticated = (client: SpotifyClient) => {
    setSpotifyClient(client)
    setIsAuthenticated(true)
  }

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div className="app">
          <Navbar isAuthenticated={isAuthenticated} />
          
          <main>
            <Routes>
              <Route 
                path="/" 
                element={
                  isAuthenticated 
                    ? <Navigate to="/search" replace /> 
                    : <HomePage 
                        clientId={clientId} 
                        clientSecret={clientSecret} 
                        redirectUri={redirectUri} 
                        onAuthenticated={handleAuthenticated} 
                      />
                } 
              />
              <Route 
                path="/callback" 
                element={
                  <HomePage 
                    clientId={clientId} 
                    clientSecret={clientSecret} 
                    redirectUri={redirectUri} 
                    onAuthenticated={handleAuthenticated} 
                  />
                } 
              />
              <Route 
                path="/search" 
                element={
                  isAuthenticated 
                    ? <SearchPage spotifyClient={spotifyClient} />
                    : <Navigate to="/" replace />
                } 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
