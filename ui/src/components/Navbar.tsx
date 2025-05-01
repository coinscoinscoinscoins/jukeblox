import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'

interface NavbarProps {
  isAuthenticated: boolean
}

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear auth data from session storage
    sessionStorage.removeItem('spotify_auth_data')
    
    // Redirect to home page
    navigate('/')
    
    // Reload the page to reset all states
    window.location.reload()
  }

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
          {isAuthenticated ? (
            <>
              <Button 
                component={Link} 
                to="/search" 
                color="inherit"
              >
                Search
              </Button>
              <Button 
                color="primary" 
                variant="contained"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              component={Link} 
              to="/" 
              color="primary" 
              variant="contained"
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