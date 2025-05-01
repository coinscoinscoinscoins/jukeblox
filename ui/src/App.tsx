import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import Navbar from './components/Navbar'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AuthProvider, ProtectedRoute, useAuth } from './contexts/AuthContext'
import SessionsListPage from './pages/SessionsListPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import CreateSessionPage from './pages/CreateSessionPage'

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

// Get environment variables (with fallbacks)
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string 
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string || 'http://localhost:8888/callback'

// App Router with Auth Provider
function AppRouter() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div className="app">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLogin={login}
        onLogout={logout}
      />
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/callback" 
            element={<HomePage />} 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } 
          />
          {/* Session Routes */}
          <Route 
            path="/sessions" 
            element={<SessionsListPage />} 
          />
          <Route 
            path="/sessions/create" 
            element={
              <ProtectedRoute>
                <CreateSessionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sessions/:sessionId" 
            element={<SessionDetailsPage />} 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider 
          clientId={clientId}
          clientSecret={clientSecret}
          redirectUri={redirectUri}
        >
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
