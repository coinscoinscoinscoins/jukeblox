import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress, 
  InputBase,
  IconButton,
  Paper,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';

// Mock data types
interface SessionListItem {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  participantCount: number;
  hostName: string;
  createdAt: string;
}

const SessionsListPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // This is just mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock session data
        const mockSessions: SessionListItem[] = [
          {
            id: 'session-1',
            name: 'Friday Night Party Mix',
            description: 'Collaborative playlist for our weekend hangout',
            isPublic: true,
            participantCount: 8,
            hostName: 'DJ Host',
            createdAt: '2023-07-15T18:00:00Z'
          },
          {
            id: 'session-2',
            name: 'Workout Motivation',
            description: 'High energy tracks to keep you going',
            isPublic: true,
            participantCount: 5,
            hostName: 'FitnessFan',
            createdAt: '2023-07-14T15:30:00Z'
          },
          {
            id: 'session-3',
            name: 'Chill Study Vibes',
            description: 'Lo-fi beats and ambient music for focus',
            isPublic: false,
            participantCount: 3,
            hostName: 'StudyBuddy',
            createdAt: '2023-07-12T20:45:00Z'
          },
          {
            id: 'session-4',
            name: 'Road Trip Playlist',
            description: 'Songs for the long journey ahead',
            isPublic: true,
            participantCount: 4,
            hostName: 'Traveler',
            createdAt: '2023-07-10T09:15:00Z'
          },
          {
            id: 'session-5',
            name: 'Coffee Shop Ambience',
            description: 'Acoustic and indie vibes',
            isPublic: true,
            participantCount: 6,
            hostName: 'CoffeeConnoisseur',
            createdAt: '2023-07-08T14:20:00Z'
          }
        ];
        
        setSessions(mockSessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);
  
  const filteredSessions = sessions.filter(session => 
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.hostName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCreateSession = () => {
    navigate('/sessions/create');
  };
  
  const handleJoinSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };
  
  // Format a date string to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Music Sessions
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSession}
            disabled={!isAuthenticated}
          >
            Create Session
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join an existing session or create your own collaborative music experience
        </Typography>
        
        <Paper 
          component="form" 
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            mb: 4,
            bgcolor: 'background.paper'
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton type="button" sx={{ p: '10px' }}>
            <SearchIcon />
          </IconButton>
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton color="primary" sx={{ p: '10px' }}>
            <SortIcon />
          </IconButton>
        </Paper>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading sessions...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : filteredSessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6">No sessions found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {searchQuery ? 'Try adjusting your search' : 'Be the first to create a session!'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleCreateSession}
              disabled={!isAuthenticated}
            >
              Create a Session
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredSessions.map(session => (
              <Grid key={session.id} item xs={12}>
                <Card sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="h2">
                          {session.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {session.description}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<PeopleIcon />} 
                            label={`${session.participantCount} Participants`} 
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            icon={session.isPublic ? <PublicIcon /> : <LockIcon />}
                            label={session.isPublic ? 'Public' : 'Private'} 
                            size="small"
                            variant="outlined"
                            color={session.isPublic ? 'success' : 'default'}
                          />
                          <Chip 
                            label={`Created ${formatDate(session.createdAt)}`} 
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleJoinSession(session.id)}
                      >
                        Join
                      </Button>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography variant="caption" color="text.secondary">
                        Hosted by {session.hostName}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default SessionsListPage; 