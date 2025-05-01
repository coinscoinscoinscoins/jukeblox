import { useState, FormEvent } from 'react'
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
import { SpotifyClient, SpotifySearchResponse } from '../../../spotify-utils/src'
import SearchIcon from '@mui/icons-material/Search'

interface SearchPageProps {
  spotifyClient: SpotifyClient | null
}

// Type definitions for Spotify items
interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  followers?: { total: number };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images?: SpotifyImage[];
  artists?: SpotifyArtist[];
  release_date?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists?: SpotifyArtist[];
  album?: SpotifyAlbum;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  owner?: { display_name: string };
  tracks?: { total: number };
}

type SearchType = 'track' | 'artist' | 'album' | 'playlist'

const SearchPage = ({ spotifyClient }: SearchPageProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('track')
  const [searchResults, setSearchResults] = useState<SpotifySearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim() || !spotifyClient) return
    
    try {
      setIsSearching(true)
      setError(null)
      
      const results = await spotifyClient.search.search({
        q: searchQuery,
        type: searchType,
        limit: 20
      })
      
      setSearchResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
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
    const items = getResultItems()
    
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
        {items.map((item: any) => (
          <Grid container item xs={12} sm={6} md={4} lg={3} key={item.id}>
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
                    {item.artists?.[0]?.name} {item.album?.name ? `• ${item.album.name}` : ''}
                  </Typography>
                )}
                
                {searchType === 'album' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.artists?.[0]?.name} {item.release_date ? `• ${item.release_date.split('-')[0]}` : ''}
                  </Typography>
                )}
                
                {searchType === 'artist' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {formatFollowers(item.followers?.total)}
                  </Typography>
                )}
                
                {searchType === 'playlist' && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.owner?.display_name} {item.tracks?.total ? `• ${item.tracks.total} tracks` : ''}
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
  const getImageUrl = (item: any): string => {
    if (item.images && item.images.length > 0) {
      return item.images[0].url
    }
    
    if (item.album?.images && item.album.images.length > 0) {
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