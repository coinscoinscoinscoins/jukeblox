import { AppBar, Toolbar, Typography, Button, Box, Chip, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'
import { WalletComponent } from './Wallet';
import { useSession } from '../contexts/SessionContext'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onLogin: () => void;
}

const Navbar = ({ isAuthenticated, onLogout, onLogin }: NavbarProps) => {
  const { currentSession, leaveSession } = useSession();

  return (
    <AppBar position="static" color="secondary" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img 
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" 
            alt="Spotify" 
            style={{ height: '24px', marginRight: '10px' }} 
          />
          JukeBlox
        </Typography>

        {currentSession && (
          <Chip
            icon={<MusicNoteIcon />}
            label={`In Session: ${currentSession.name}`}
            color="primary"
            component={Link}
            to={`/sessions/${currentSession.id}`}
            clickable
            sx={{ 
              mr: 2, 
              '& .MuiChip-label': { fontWeight: 500 },
              height: '32px',
              '&:hover': { opacity: 0.9 }
            }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Wallet />
          <Button 
            component={Link} 
            to="/sessions" 
            color="inherit"
          >
            Sessions
          </Button>
          {isAuthenticated ? (
            <>
              <Button 
                component={Link} 
                to="/search" 
                color="inherit"
              >
                Search
              </Button>
              {isAuthenticated && (
                <Button 
                  component={Link}
                  to="/sessions/create"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: '20px', 
                    borderWidth: '2px',
                    '&:hover': { borderWidth: '2px' } 
                  }}
                >
                  Create Session
                </Button>
              )}
              
              {currentSession && (
                <Tooltip title="Leave current session">
                  <Button
                    color="primary"
                    variant="outlined"
                    startIcon={<ExitToAppIcon />}
                    onClick={leaveSession}
                    sx={{ 
                      borderRadius: '20px', 
                      borderWidth: '2px',
                      '&:hover': { borderWidth: '2px' } 
                    }}
                  >
                    Leave
                  </Button>
                </Tooltip>
              )}
              
              <Button 
                color="primary" 
                variant="contained"
                onClick={onLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              color="primary" 
              variant="contained"
              onClick={onLogin}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar 