import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Button, 
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Grid,
  IconButton,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { useReadContract } from 'wagmi';
import { jukebloxContract, JukebloxAbi } from '../lib/JukebloxContract';
import { SpotifyTrack } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PeopleIcon from '@mui/icons-material/People';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Mock data interfaces
interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
}

interface SessionTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  albumArt?: string;
  addedBy: string;
  isValid: boolean;
}

interface SessionData {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  host: SessionParticipant;
  participants: SessionParticipant[];
  currentTrack?: SessionTrack;
  queue: SessionTrack[];
  isPlaying: boolean;
}

const SessionDetailsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAuthenticated, spotifyClient } = useAuth();
  const { currentSession, joinSession, leaveSession } = useSession();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [trackDetails, setTrackDetails] = useState<Record<string, SpotifyTrack>>({});

  // Add contract read hook for song requests
  const { data: songRequests, isLoading: isLoadingSongs } = useReadContract({
    abi: JukebloxAbi,
    address: jukebloxContract,
    functionName: 'getSongRequests',
    args: sessionId ? [BigInt(sessionId.replace('session-', ''))] : undefined,
  });

  // Add contract read hook for session details
  const { data: sessionDetails } = useReadContract({
    abi: JukebloxAbi,
    address: jukebloxContract,
    functionName: 'sessions',
    args: sessionId ? [BigInt(sessionId.replace('session-', ''))] : undefined,
  });

  // Fetch track details from Spotify
  useEffect(() => {
    const fetchTrackDetails = async () => {
      if (!spotifyClient || !songRequests) return;

      try {
        // Ensure we have a valid client credentials token
        await spotifyClient.auth.getClientCredentialsToken();
        
        const newTrackDetails: Record<string, SpotifyTrack> = {};
        
        for (const request of songRequests) {
          if (trackDetails[request.songId]) continue; // Skip if we already have details
          
          try {
            // Check if the songId is a valid Spotify track ID format
            if (!/^[a-zA-Z0-9]{22}$/.test(request.songId)) {
              console.warn(`Invalid Spotify track ID format: ${request.songId}`);
              continue;
            }

            // Use the tracks endpoint with client credentials
            const response = await fetch(`https://api.spotify.com/v1/tracks/${request.songId}`, {
              headers: {
                'Authorization': `Bearer ${await spotifyClient.auth.getValidToken()}`
              }
            });

            if (!response.ok) {
              if (response.status === 404) {
                console.warn(`No Spotify track found for ID: ${request.songId}`);
              } else {
                console.error(`Failed to fetch track ${request.songId}: ${response.statusText}`);
              }
              continue;
            }

            const track = await response.json();
            newTrackDetails[request.songId] = track;
          } catch (err) {
            console.error(`Failed to fetch details for track ${request.songId}:`, err);
          }
        }
        
        setTrackDetails(prev => ({ ...prev, ...newTrackDetails }));
      } catch (err) {
        console.error('Error fetching track details:', err);
      }
    };

    fetchTrackDetails();
  }, [spotifyClient, songRequests]);

  useEffect(() => {
    // Check if already joined this session
    if (currentSession && currentSession.id === sessionId) {
      setSession(currentSession);
      setHasJoined(true);
      setLoading(false);
      return;
    }
    
    // Fetch session data
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // Convert song requests to our track format
        const tracks = songRequests?.map((request, index) => {
          const spotifyTrack = trackDetails[request.songId];
          const isValidSpotifyId = /^[a-zA-Z0-9]{22}$/.test(request.songId);
          
          return {
            id: `track-${index}`,
            name: spotifyTrack?.name || (isValidSpotifyId ? 'Loading...' : 'Invalid Track ID'),
            artist: spotifyTrack?.artists?.[0]?.name || (isValidSpotifyId ? 'Loading...' : 'Unknown Artist'),
            album: spotifyTrack?.album?.name || (isValidSpotifyId ? 'Loading...' : 'Unknown Album'),
            duration: spotifyTrack?.duration_ms || 0,
            albumArt: spotifyTrack?.album?.images?.[0]?.url || 'https://placehold.co/400x400?text=Invalid+Track',
            addedBy: request.requester,
            isValid: isValidSpotifyId
          };
        }) || [];

        // Create session data from contract data
        const sessionData: SessionData = {
          id: sessionId || '',
          name: sessionDetails?.[2] || 'Unknown Session', // name from contract
          description: 'Session created on Jukeblox',
          isPublic: true,
          host: {
            id: 'host-1',
            name: 'Session Host',
            isHost: true
          },
          participants: [], // We don't have this data from contract
          currentTrack: tracks[0],
          queue: tracks.slice(1),
          isPlaying: false
        };
        
        setSession(sessionData);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId && !isLoadingSongs && songRequests && sessionDetails) {
      fetchSessionData();
    }
  }, [sessionId, currentSession, songRequests, sessionDetails, isLoadingSongs, trackDetails]);

  const handlePlayPause = () => {
    if (!session) return;
    setSession({
      ...session,
      isPlaying: !session.isPlaying
    });
  };
  
  const handleSkipTrack = () => {
    if (!session || session.queue.length === 0) return;
    
    const newQueue = [...session.queue];
    const nextTrack = newQueue.shift();
    
    setSession({
      ...session,
      currentTrack: nextTrack,
      queue: newQueue,
      isPlaying: true
    });
  };
  
  const handleShareSession = () => {
    navigator.clipboard.writeText(window.location.href);
    // Implement share functionality here
    alert('Session link copied to clipboard!');
  };
  
  const handleJoinSession = () => {
    if (!session) return;
    
    // In a real app, you would send a request to join the session before updating UI
    joinSession(session);
    setHasJoined(true);
  };
  
  const handleLeaveSession = () => {
    leaveSession();
    setHasJoined(false);
  };
  
  // Update the track rendering to show invalid state
  const renderTrackInfo = (track: SessionTrack) => {
    if (!track.isValid) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            variant="rounded"
            src={track.albumArt}
            alt={track.album}
            sx={{ bgcolor: 'error.main' }}
          >
            <MusicNoteIcon />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body1" color="error">
              {track.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invalid Spotify Track ID
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          variant="rounded"
          src={track.albumArt}
          alt={track.album}
        >
          <MusicNoteIcon />
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography variant="body1">{track.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {track.artist} • {track.album}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading session...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (error || !session) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error || 'Session not found'}</Alert>
          <Button variant="contained" onClick={() => navigate('/sessions')}>
            Back to Sessions
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {session.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {session.description}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Chip 
                icon={<PeopleIcon />} 
                label={`${session.participants.length} Participants`} 
                variant="outlined" 
              />
              <Chip 
                label={session.isPublic ? 'Public Session' : 'Private Session'} 
                variant="outlined" 
                color={session.isPublic ? 'success' : 'default'} 
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!hasJoined && isAuthenticated && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={handleJoinSession}
              >
                Join Session
              </Button>
            )}
            
            {hasJoined && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={handleLeaveSession}
              >
                Leave Session
              </Button>
            )}
            
            <Button 
              variant="outlined" 
              startIcon={<ShareIcon />}
              onClick={handleShareSession}
            >
              Share
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          {/* Now Playing Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Now Playing</Typography>
              
              {session.currentTrack ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flexShrink: 0 }}>
                      <img 
                        src={session.currentTrack.albumArt || 'https://placehold.co/400x400?text=No+Image'} 
                        alt={`${session.currentTrack.album} cover`} 
                        style={{ width: 120, height: 120, borderRadius: 4 }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h5">{session.currentTrack.name}</Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {session.currentTrack.artist}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.currentTrack.album}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Added by Anonymous
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <IconButton 
                          color="primary" 
                          sx={{ bgcolor: 'rgba(29, 185, 84, 0.1)' }}
                          onClick={handlePlayPause}
                        >
                          {session.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton 
                          color="primary"
                          onClick={handleSkipTrack}
                          disabled={session.queue.length === 0}
                        >
                          <SkipNextIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MusicNoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography>No track currently playing</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/search')}
                  >
                    Add a track
                  </Button>
                </Box>
              )}
            </Paper>
            
            {/* Queue Section */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Up Next</Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => navigate('/search')}
                >
                  Add Track
                </Button>
              </Box>
              
              {session.queue.length > 0 ? (
                <List>
                  {session.queue.map((track, index) => (
                    <ListItem key={track.id} divider={index < session.queue.length - 1}>
                      {renderTrackInfo(track)}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Added by Anonymous
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">The queue is empty</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SessionDetailsPage; 