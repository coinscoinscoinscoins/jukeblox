import { Container, Typography, Box, Button, Stack } from '@mui/material'
import { SpotifyAuth } from '../components/SpotifyAuth'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleIcon from '@mui/icons-material/Add'
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet'
import { useAccount } from 'wagmi'

const HomePage = () => {
  const account = useAccount();
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
          Welcome to JukeBlox
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 6, color: 'text.secondary' }}>
          Your Spotify-powered music exploration platform
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ width: '100%', maxWidth: 600, mb: 8 }}>
            <Typography variant="body1" sx={{ mb: 4 }}>
              You're logged in! Start exploring Spotify's vast music library or join a collaborative music session.
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 4 }}>
              <Button
                component={Link}
                to="/search"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<SearchIcon />}
                sx={{ py: 2 }}
              >
                Search Music
              </Button>
              
              <Button
                component={Link}
                to="/sessions"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<GroupIcon />}
                sx={{ py: 2 }}
              >
                Browse Sessions
              </Button>
              
              <Button
                component={Link}
                to="/sessions/create"
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                startIcon={<AddCircleIcon />}
                sx={{ py: 2 }}
              >
                Create Session
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 500, mb: 8 }}>
            <Typography variant="body1" sx={{ mb: 4 }}>
              JukeBlox lets you search for your favorite artists, albums, and tracks 
              using the Spotify API. Login with your Spotify account to get started.
            </Typography>
            
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 4,
                boxShadow: 3,
              }}
            >
              <SpotifyAuth />
            </Box>
          </Box>
        )}
          
          {/* Blockchain Integration Section */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 4,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>JukeBlox Sessions</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Connect your wallet to create music listening sessions on the blockchain
            </Typography>

            {!account?.address ? (
              <Wallet>
                <ConnectWallet>
                  <Button variant="contained" color="primary" fullWidth>
                    Connect Wallet
                  </Button>
                </ConnectWallet>
              </Wallet>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </Typography>
                <Button 
                  component={Link}
                  to="/sessions/create"
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Create New Session
                </Button>
              </>
            )}
          </Box>
        </Box>
        
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ mb: 2 }} align='center'>
            Features
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <FeatureCard 
              title="Search" 
              description="Find your favorite music using Spotify's extensive catalog"
            />
            <FeatureCard 
              title="Collaborate" 
              description="Create and join music sessions with friends"
            />
            <FeatureCard 
              title="Share" 
              description="Share your discoveries with the community"
            />
          </Box>
        </Box>


    </Container>

  )
}

interface FeatureCardProps {
  title: string
  description: string
}

const FeatureCard = ({ title, description }: FeatureCardProps) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      p: 3,
      borderRadius: 2,
      width: 200,
      textAlign: 'center',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {description}
    </Typography>
  </Box>
)

export default HomePage 