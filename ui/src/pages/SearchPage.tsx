import { useState, FormEvent, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  CardMedia, 
  Tooltip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import { useAuth } from '../contexts/AuthContext'
import { useSession } from '../contexts/SessionContext'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { jukebloxContract, JukebloxAbi } from '../lib/JukebloxContract'
import { 
  SpotifySearchResponse,
  SpotifyTrack
} from '../types'

const SearchPage = () => {
  const { spotifyClient } = useAuth();
  const { currentSession } = useSession();
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotifySearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [addedTrack, setAddedTrack] = useState<string | null>(null)
  const [processingTrack, setProcessingTrack] = useState<string | null>(null)

  // Contract interaction hooks
  const { 
    data: hash, 
    isPending, 
    writeContract 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ 
    hash 
  });

  // Reset added track notification when transaction confirms
  useEffect(() => {
    if (isConfirmed && processingTrack) {
      setAddedTrack(processingTrack)
      setProcessingTrack(null)
      setTimeout(() => setAddedTrack(null), 3000)
    }
  }, [isConfirmed, processingTrack])

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
      
      console.debug(`Starting search for "${searchQuery}" with type "track"`)
      
      // Check for valid token before searching
      try {
        await spotifyClient.auth.getValidToken()
      } catch (tokenErr) {
        console.error('Token validation failed:', tokenErr)
        setError('Authentication error: Unable to get a valid token. Try logging in again.')
        setIsSearching(false)
        return
      }
      
      // Proceed with search - only for tracks now
      const results = await spotifyClient.search.search({
        q: searchQuery,
        type: 'track',
        market: 'from_token',
        limit: 50
      })
      
      setSearchResults(results)
      
      // Show count of results
      const count = results.tracks?.items?.length || 0
      if (count === 0) {
        setDebugInfo(`No tracks found matching "${searchQuery}"`)
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
          errorMessage = 'Access denied for track searches. Try logging in with your Spotify account instead of using client credentials.'
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
  const getTrackResults = (): SpotifyTrack[] => {
    if (!searchResults || !searchResults.tracks) return []
    return searchResults.tracks.items || []
  }

  const handleAddToSession = (track: SpotifyTrack) => {
    if (!currentSession) {
      setError('You are not currently in a session. Join a session first to add tracks.')
      return
    }

    try {
      // Save the track being processed
      setProcessingTrack(track.name)
      
      // Use the current session ID
      // const sessionId = parseInt(currentSession.id)
      const sessionId = 10
      console.log("sessionId", sessionId, typeof sessionId)
      
      // Call the contract's addSongRequest function
      writeContract({
        address: jukebloxContract,
        abi: JukebloxAbi,
        functionName: 'addSongRequest',
        args: [BigInt(sessionId), track.id],
        value: BigInt(1), // Sending 1 wei as the cost
      })
    } catch (err) {
      console.error('Failed to add track to session:', err)
      setError(err instanceof Error ? err.message : 'Failed to add track to session')
      setProcessingTrack(null)
    }
  }

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const renderSearchResults = () => {
    const tracks = getTrackResults()
    
    if (isSearching) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      )
    }
    
    if (tracks.length === 0 && searchResults) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6">No results found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        </Box>
      )
    }
    
    return (
      <TableContainer component={Paper} sx={{ mt: 4, bgcolor: 'background.paper' }}>
        <Table sx={{ minWidth: 650 }} aria-label="search results">
          <TableHead>
            <TableRow>
              <TableCell width={60}>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Album</TableCell>
              <TableCell width={100} align="right">Duration</TableCell>
              <TableCell width={80} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tracks.map((track, index) => (
              <TableRow 
                key={track.id}
                sx={{ 
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
                      image={track.album.images[0]?.url || 'https://placehold.co/40x40?text=No+Image'}
                      alt={track.name}
                    />
                    <Box>
                      <Typography variant="body1">{track.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {track.album.name}
                </TableCell>
                <TableCell align="right">
                  {formatDuration(track.duration_ms)}
                </TableCell>
                <TableCell align="center">
                  {currentSession && (
                    <Tooltip title="Add to current session queue">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAddToSession(track)}
                        disabled={isPending || isConfirming || processingTrack === track.name}
                      >
                        {(isPending || isConfirming) && processingTrack === track.name ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <AddIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Search Spotify
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {currentSession && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Currently in session: <strong>{currentSession.name}</strong> — Search for tracks to add to this session.
        </Alert>
      )}
      
      {debugInfo && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {debugInfo}
        </Alert>
      )}
      
      {hash && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
          {isConfirmed ? ' (Confirmed)' : ' (Pending)'}
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
          placeholder="Search for tracks..."
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
      
      <Snackbar 
        open={!!addedTrack}
        autoHideDuration={3000}
        onClose={() => setAddedTrack(null)}
      >
        <Alert severity="success" variant="filled">
          Added "{addedTrack}" to session queue
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default SearchPage 