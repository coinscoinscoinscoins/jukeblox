import { Container, Typography, Box } from '@mui/material'
import { SpotifyAuth } from '../components/SpotifyAuth'
import { SpotifyClient } from '../../../spotify-utils/src'

interface HomePageProps {
  clientId: string
  clientSecret: string
  redirectUri: string
  onAuthenticated: (client: SpotifyClient) => void
}

const HomePage = ({ clientId, clientSecret, redirectUri, onAuthenticated }: HomePageProps) => {
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
            <SpotifyAuth
              clientId={clientId}
              clientSecret={clientSecret}
              redirectUri={redirectUri}
              onAuthenticated={onAuthenticated}
            />
          </Box>
        </Box>
        
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Features
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <FeatureCard 
              title="Search" 
              description="Find your favorite music using Spotify's extensive catalog"
            />
            <FeatureCard 
              title="Discover" 
              description="Explore new artists and tracks based on your preferences"
            />
            <FeatureCard 
              title="Share" 
              description="Share your discoveries with friends"
            />
          </Box>
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