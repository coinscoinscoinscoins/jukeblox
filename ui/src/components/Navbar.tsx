import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import { WalletComponent } from './Wallet';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onLogin: () => void;
}

const Navbar = ({ isAuthenticated, onLogout, onLogin }: NavbarProps) => {
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            component={Link} 
            to="/sessions" 
            color="inherit"
          >
            Sessions
          </Button>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <WalletComponent />
          </Box>

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