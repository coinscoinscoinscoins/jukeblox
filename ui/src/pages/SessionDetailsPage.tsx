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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PeopleIcon from '@mui/icons-material/People';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ShareIcon from '@mui/icons-material/Share';

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
  const navigate = useNavigate();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch session data
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // This is just mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock session data
        const mockSession: SessionData = {
          id: sessionId || '',
          name: 'Friday Night Party Mix',
          description: 'Collaborative playlist for our weekend hangout',
          isPublic: true,
          host: {
            id: 'user-1',
            name: 'DJ Host',
            avatar: 'https://i.pravatar.cc/150?img=1',
            isHost: true
          },
          participants: [
            {
              id: 'user-1',
              name: 'DJ Host',
              avatar: 'https://i.pravatar.cc/150?img=1',
              isHost: true
            },
            {
              id: 'user-2',
              name: 'Music Lover',
              avatar: 'https://i.pravatar.cc/150?img=2',
              isHost: false
            },
            {
              id: 'user-3',
              name: 'Playlist Pro',
              avatar: 'https://i.pravatar.cc/150?img=3',
              isHost: false
            }
          ],
          currentTrack: {
            id: 'track-1',
            name: 'Hotel California',
            artist: 'Eagles',
            album: 'Hotel California',
            duration: 390000,
            albumArt: 'https://i.scdn.co/image/ab67616d00001e02a500e3fa0f9d738ebe2e49cd',
            addedBy: 'user-1'
          },
          queue: [
            {
              id: 'track-2',
              name: 'Bohemian Rhapsody',
              artist: 'Queen',
              album: 'A Night at the Opera',
              duration: 354000,
              albumArt: 'https://i.scdn.co/image/ab67616d00001e02c6a5b2475c9ce6d598a08bb1',
              addedBy: 'user-2'
            },
            {
              id: 'track-3',
              name: 'Sweet Child O\' Mine',
              artist: 'Guns N\' Roses',
              album: 'Appetite for Destruction',
              duration: 356000,
              albumArt: 'https://i.scdn.co/image/ab67616d00001e02996ee235f2f75787f5e5b42c',
              addedBy: 'user-3'
            }
          ],
          isPlaying: true
        };
        
        setSession(mockSession);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchSessionData();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

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
          
          <Button 
            variant="outlined" 
            startIcon={<ShareIcon />}
            onClick={handleShareSession}
          >
            Share
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          {/* Now Playing Section */}
          <Grid item xs={12} md={8}>
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
                        Added by {session.participants.find(p => p.id === session.currentTrack?.addedBy)?.name}
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
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded"
                          src={track.albumArt}
                          alt={track.album}
                        >
                          <MusicNoteIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={track.name}
                        secondary={`${track.artist} • ${track.album}`}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Added by {session.participants.find(p => p.id === track.addedBy)?.name}
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
          
          {/* Participants Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Participants</Typography>
              
              <List>
                {session.participants.map((participant, index) => (
                  <ListItem key={participant.id} divider={index < session.participants.length - 1}>
                    <ListItemAvatar>
                      <Avatar src={participant.avatar}>
                        {participant.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={participant.name}
                      secondary={participant.isHost ? 'Host' : 'Participant'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SessionDetailsPage; 