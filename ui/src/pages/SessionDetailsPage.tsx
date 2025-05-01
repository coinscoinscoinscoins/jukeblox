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
import BugReportIcon from '@mui/icons-material/BugReport';

// Add debug component to show when enabled
const DebugInfo = ({ data, title }: { data: Record<string, unknown> | null | undefined; title: string }) => {
  const [show, setShow] = useState(false);
  
  return (
    <Box sx={{ mt: 2, p: 2, border: '1px dashed gray', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Button 
          size="small" 
          startIcon={<BugReportIcon />}
          onClick={() => setShow(!show)}
        >
          {show ? 'Hide Debug' : 'Show Debug'}
        </Button>
      </Box>
      {show && (
        <Box 
          component="pre" 
          sx={{ 
            p: 2, 
            bgcolor: 'black', 
            color: 'lime', 
            overflow: 'auto', 
            fontSize: '12px',
            maxHeight: '300px' 
          }}
        >
          {JSON.stringify(data, null, 2)}
        </Box>
      )}
    </Box>
  );
};

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
  songId: string;
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

// Import type for song requests if it exists, otherwise create one
interface SongRequest {
  songId: string;
  requester: string;
  timestamp?: string | number; // Make timestamp optional
  [key: string]: any; // For other properties we might not know about
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

  // Add debugging to examine contract data
  useEffect(() => {
    if (songRequests) {
      try {
        console.log("====== CONTRACT DATA INSPECTION ======");
        // Deep inspection of the songRequests data
        console.log("Type of songRequests:", typeof songRequests);
        console.log("Is Array?", Array.isArray(songRequests));
        console.log("Length:", songRequests.length);
        
        // Check if the data is actually limited/sliced somewhere
        console.log("Keys of songRequests object:", Object.keys(songRequests));
        
        // Stringifying can reveal hidden properties or structures
        const stringifiedData = JSON.stringify(songRequests);
        console.log("Stringified length:", stringifiedData.length);
        if (stringifiedData.length < 1000) {
          console.log("Full stringified data:", stringifiedData);
        } else {
          console.log("Partial stringified data:", stringifiedData.substring(0, 1000) + "...");
        }
        
        // Try to see if the contract is returning a limited number of results
        console.log("First few items:", songRequests.slice(0, 3));
        if (songRequests.length > 3) {
          console.log("Items 3-5:", songRequests.slice(3, 6));
        }
        
        console.log("====== END CONTRACT DATA INSPECTION ======");
      } catch (error) {
        console.error("Error inspecting contract data:", error);
      }
    }
  }, [songRequests]);

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
        
        console.log("Fetching details for song requests:", songRequests);
        
        // Check for duplicated song IDs in the requests
        const songIds = songRequests.map(req => req.songId);
        const uniqueSongIds = [...new Set(songIds)];
        console.log("Total song IDs in requests:", songIds.length);
        console.log("Unique song IDs in requests:", uniqueSongIds.length);
        console.log("Song ID counts:", songIds.reduce((acc, id) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        // IMPORTANT: We only need to fetch details for unique songIds
        // But we need to make sure all ids are fetched
        for (const songId of uniqueSongIds) {
          // Only fetch if we don't already have the details
          if (trackDetails[songId]) {
            console.log(`Using cached details for track: ${songId}`);
            continue;
          }
          
          try {
            // Check if the songId is a valid Spotify track ID format
            if (!/^[a-zA-Z0-9]{22}$/.test(songId)) {
              console.warn(`Invalid Spotify track ID format: ${songId}`);
              continue;
            }

            console.log(`Fetching details for track ID: ${songId}`);
            
            // Use the tracks endpoint with client credentials
            const response = await fetch(`https://api.spotify.com/v1/tracks/${songId}`, {
              headers: {
                'Authorization': `Bearer ${await spotifyClient.auth.getValidToken()}`
              }
            });

            if (!response.ok) {
              if (response.status === 404) {
                console.warn(`No Spotify track found for ID: ${songId}`);
              } else {
                console.error(`Failed to fetch track ${songId}: ${response.statusText}`);
              }
              continue;
            }

            const track = await response.json();
            newTrackDetails[songId] = track;
            console.log(`Successfully fetched details for track: ${track.name}`);
          } catch (err) {
            console.error(`Failed to fetch details for track ${songId}:`, err);
          }
        }
        
        console.log("New track details to add:", Object.keys(newTrackDetails).length);
        setTrackDetails(prev => {
          const updated = { ...prev, ...newTrackDetails };
          console.log("Updated trackDetails state:", Object.keys(updated).length, "tracks");
          return updated;
        });
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
        
        // Check if songRequests is defined and valid
        if (!songRequests) {
          console.log("No song requests available");
          return;
        }
        
        console.log("Starting to process songRequests:", songRequests.length, "items");
        
        // Log the raw requests before we start processing them
        console.log("Original song requests array:", JSON.stringify(songRequests));
        
        // THIS is where the deduplication might be happening
        // Let's check if we're filtering out song requests with the same ID
        const songIdSet = new Set();
        songRequests.forEach(request => {
          if (songIdSet.has(request.songId)) {
            console.log(`DUPLICATE FOUND: ${request.songId} - This might be filtered out later`);
          }
          songIdSet.add(request.songId);
        });
        
        // Convert song requests to our track format
        // IMPORTANT: DO NOT DEDUPE - process each request separately even if IDs are the same
        const tracks = songRequests?.map((request, index) => {
          console.log(`Processing request ${index}:`, request);
          const spotifyTrack = trackDetails[request.songId];
          const isValidSpotifyId = /^[a-zA-Z0-9]{22}$/.test(request.songId);
          
          // Create unique IDs for each track, even if they have the same song ID
          const track = {
            id: `track-${index}`, // This ensures a unique ID for each track
            // Use the song data we've already fetched from Spotify
            name: spotifyTrack?.name || (isValidSpotifyId ? 'Loading...' : 'Invalid Track ID'),
            artist: spotifyTrack?.artists?.[0]?.name || (isValidSpotifyId ? 'Loading...' : 'Unknown Artist'),
            album: spotifyTrack?.album?.name || (isValidSpotifyId ? 'Loading...' : 'Unknown Album'),
            duration: spotifyTrack?.duration_ms || 0,
            albumArt: spotifyTrack?.album?.images?.[0]?.url || 'https://placehold.co/400x400?text=Invalid+Track',
            addedBy: request.requester,
            isValid: isValidSpotifyId,
            // Add the original song ID so we can reference it later if needed
            songId: request.songId
          };
          
          console.log(`Created track ${index}:`, track);
          return track;
        }) || [];

        console.log("tracks", tracks);
        console.log("IMPORTANT: Created tracks count:", tracks.length);
        console.log("currentTrack assigned:", tracks[0]);
        console.log("queue assigned:", tracks.slice(1));
        console.log("queue length being set:", tracks.slice(1).length);
        
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
          // Use all tracks except the first one for the queue
          queue: tracks.slice(1),
          isPlaying: false
        };
        
        console.log("Session data being set:", sessionData);
        console.log("Queue in session data:", sessionData.queue);
        console.log("Queue length in session data:", sessionData.queue.length);
        
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

  useEffect(() => {
    console.log("session HERE", session)
  }, [session])

  // Add improved debugging in queue rendering effect
  useEffect(() => {
    if (session) {
      console.log("QUEUE RENDERING DEBUG:");
      console.log("- Queue length:", session?.queue?.length || 0);
      console.log("- Queue contents:", JSON.stringify(session?.queue));
      console.log("- Full session data:", JSON.stringify(session));
      
      session?.queue?.forEach((track, index) => {
        console.log(`- Track at index ${index}:`, track);
      });
    }
  }, [session?.queue]);
  
  const handleSkipTrack = () => {
    if (!session || session.queue.length === 0) return;
    
    const newQueue = [...session.queue];
    const nextTrack = newQueue.shift();
    
    console.log("Skipping to next track:", nextTrack);
    console.log("New queue length:", newQueue.length);
    
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
  
  // Add a helper function to render song request items
  const renderSongRequestItem = (request: SongRequest) => {
    const spotifyTrack = trackDetails[request.songId];
    const isValidSpotifyId = /^[a-zA-Z0-9]{22}$/.test(request.songId);
    
    // If we have Spotify data, show it, otherwise show fallback
    const trackName = spotifyTrack?.name || (isValidSpotifyId ? 'Loading...' : 'Invalid Track ID');
    const artistName = spotifyTrack?.artists?.[0]?.name || (isValidSpotifyId ? 'Loading...' : 'Unknown Artist');
    const albumName = spotifyTrack?.album?.name || (isValidSpotifyId ? 'Loading...' : 'Unknown Album');
    const albumArt = spotifyTrack?.album?.images?.[0]?.url || 'https://placehold.co/400x400?text=Invalid+Track';
    
    // Display for invalid tracks
    if (!isValidSpotifyId) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            variant="rounded"
            src={albumArt}
            alt={albumName}
            sx={{ bgcolor: 'error.main' }}
          >
            <MusicNoteIcon />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body1" color="error">
              {trackName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invalid Spotify Track ID
            </Typography>
          </Box>
        </Box>
      );
    }
    
    // Display for valid tracks
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          variant="rounded"
          src={albumArt}
          alt={albumName}
        >
          <MusicNoteIcon />
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography variant="body1">{trackName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {artistName} • {albumName}
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
              
              {/* Add debug component for current track */}
              <DebugInfo 
                data={session.currentTrack as unknown as Record<string, unknown>} 
                title="Current Track Debug Info" 
              />
            </Paper>
            
            {/* Queue Section */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Up Next ({songRequests ? songRequests.length - 1 : 0} tracks)
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => navigate('/search')}
                >
                  Add Track
                </Button>
              </Box>
              
              {songRequests && songRequests.length > 1 ? (
                <List>
                  {/* Skip the first song request (now playing) and render the rest */}
                  {songRequests.slice(1).map((request, index) => (
                    <ListItem 
                      key={`request-${index}`} 
                      divider={index < songRequests.length - 2}
                    >
                      {renderSongRequestItem(request)}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Added by {request.requester.substring(0, 6)}...
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">The queue is empty</Typography>
                </Box>
              )}
              
              {/* Debug info remains the same */}
              <DebugInfo 
                data={{
                  queueLength: songRequests ? songRequests.length - 1 : 0,
                  rawSongRequests: songRequests ? {
                    length: songRequests.length,
                    items: songRequests
                  } : null,
                  trackDetails: {
                    count: Object.keys(trackDetails).length,
                    keys: Object.keys(trackDetails)
                  }
                }} 
                title="Queue Debug Info" 
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SessionDetailsPage; 