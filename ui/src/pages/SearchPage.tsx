import { useState, FormEvent, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useAuth } from '../contexts/AuthContext'
import { 
  SpotifySearchResponse,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTrack
} from '../types'

type SearchType = 'track' | 'artist' | 'album' | 'playlist'

type SearchItemType = SpotifyTrack | SpotifyArtist | SpotifyAlbum | SpotifyPlaylist;

const SearchPage = () => {
  const { spotifyClient } = useAuth();
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('track')
  const [searchResults, setSearchResults] = useState<SpotifySearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Check if client is properly initialized
  useEffect(() => {
    if (!spotifyClient) {
      setDebugInfo('Warning: Spotify client is null. Authentication may have failed.')
    } else {
      setDebugInfo(null)
    }
  }, [spotifyClient])

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }
    
    if (!spotifyClient) {
      setError('Spotify client is not initialized. Try logging in again.')
      return
    }
    
    try {
      setIsSearching(true)
      setError(null)
      
      console.debug(`Starting search for "${searchQuery}" with type "${searchType}"`)
      
      // Check for valid token before searching
      try {
        await spotifyClient.auth.getValidToken()
      } catch (tokenErr) {
        console.error('Token validation failed:', tokenErr)
        setError('Authentication error: Unable to get a valid token. Try logging in again.')
        setIsSearching(false)
        return
      }
      
      // Proceed with search
      const results = await spotifyClient.search.search({
        q: searchQuery,
        type: searchType,
        market: 'from_token', // Add market parameter to help with authorization
        limit: 20
      })
      
      setSearchResults(results)
      
      // Show count of results
      const count = results[`${searchType}s`]?.items?.length || 0
      if (count === 0) {
        setDebugInfo(`No ${searchType}s found matching "${searchQuery}"`)
      } else {
        setDebugInfo(null)
      }
    } catch (err) {
      console.error('Search error:', err)
      
      let errorMessage = 'Search failed'
      
      if (err instanceof Error) {
        errorMessage = err.message
        
        // Handle specific known errors
        if (errorMessage.includes('403')) {
          errorMessage = `Access denied for ${searchType} searches. Try a different search type or login with your Spotify account instead of using client credentials.`
        } else if (errorMessage.includes('401')) {
          errorMessage = 'Authentication expired. Please log in again.'
        } else if (errorMessage.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.'
        }
      }
      
      setError(errorMessage)
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }

  // Helper to get the appropriate items array based on the search type
  const getResultItems = () => {
    if (!searchResults) return []
    
    const key = `${searchType}s` as keyof SpotifySearchResponse
    return searchResults[key]?.items || []
  }

  const renderSearchResults = () => {
    const items = getResultItems() as SearchItemType[]
    
    if (isSearching) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      )
    }
    
    if (items.length === 0 && searchResults) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6">No results found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or search type
          </Typography>
        </Box>
      )
    }
    
    return (
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {items.map((item: SearchItemType) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: 'background.paper',
                transition: 'transform 0.2s',
                width: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardMedia
                component="img"
                sx={{ height: 160 }}
                image={getImageUrl(item)}
                alt={item.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" component="div" noWrap>
                  {item.name}
                </Typography>
                
                {searchType === 'track' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {(item as SpotifyTrack).artists?.[0]?.name} {(item as SpotifyTrack).album?.name ? `• ${(item as SpotifyTrack).album.name}` : ''}
                  </Typography>
                )}
                
                {searchType === 'album' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {(item as SpotifyAlbum).artists?.[0]?.name} {(item as SpotifyAlbum).release_date ? `• ${(item as SpotifyAlbum).release_date.split('-')[0]}` : ''}
                  </Typography>
                )}
                
                {searchType === 'artist' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {formatFollowers((item as SpotifyArtist).followers?.total)}
                  </Typography>
                )}
                
                {searchType === 'playlist' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {(item as SpotifyPlaylist).owner?.display_name} {(item as SpotifyPlaylist).tracks?.total ? `• ${(item as SpotifyPlaylist).tracks.total} tracks` : ''}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  // Helper to extract image URL from result item
  const getImageUrl = (item: SearchItemType): string => {
    if ('images' in item && item.images && item.images.length > 0) {
      return item.images[0].url
    }
    
    if ('album' in item && item.album?.images && item.album.images.length > 0) {
      return item.album.images[0].url
    }
    
    // Default image if none available
    return 'https://placehold.co/400x400?text=No+Image'
  }

  // Format followers count (e.g., 1.2M, 5.3K)
  const formatFollowers = (count?: number): string => {
    if (!count) return '0 followers'
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`
    }
    
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`
    }
    
    return `${count} followers`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Search Spotify
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {debugInfo && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {debugInfo}
        </Alert>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSearch}
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2,
          alignItems: 'flex-start',
          mb: 4 
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            sx: { 
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-input': {
                color: 'text.primary'
              }
            }
          }}
          sx={{ flex: 1 }}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="search-type-label">Type</InputLabel>
          <Select
            labelId="search-type-label"
            value={searchType}
            label="Type"
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="track">Tracks</MenuItem>
            <MenuItem value="artist">Artists</MenuItem>
            <MenuItem value="album">Albums</MenuItem>
            <MenuItem value="playlist">Playlists</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isSearching || !searchQuery.trim()}
          startIcon={<SearchIcon />}
          sx={{ px: 4 }}
        >
          Search
        </Button>
      </Box>
      
      {renderSearchResults()}
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default SearchPage 