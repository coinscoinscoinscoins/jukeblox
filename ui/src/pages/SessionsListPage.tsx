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
  Stack,
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
import { useReadContract, useInfiniteReadContracts } from 'wagmi';
import { jukebloxContract, JukebloxAbi } from '../lib/JukebloxContract';

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

// Contract session type
interface ContractSession {
  start: bigint;
  end: bigint;
}

const SessionsListPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Read total sessions from contract
  const { 
    data: totalSessions,
    isLoading: isLoadingTotalSessions,
    isError: isTotalSessionsError
  } = useReadContract({
    address: jukebloxContract,
    abi: JukebloxAbi,
    functionName: 'totalSessions',
  });
  
  // Fetch session details with pagination (limit 50 per page)
  const {
    data: sessionData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingSessionDetails,
    isError: isSessionDetailsError
  } = useInfiniteReadContracts({
    cacheKey: 'sessionDetails',
    contracts(pageParam: number) {
      // If we don't have totalSessions yet, return empty array
      if (totalSessions === undefined) {
        return [];
      }
      
      // Calculate how many sessions to fetch in this page
      const totalSessionsNum = Number(totalSessions);
      const startIdx = pageParam;
      const endIdx = Math.min(startIdx + 50, totalSessionsNum);
      
      // If there are no sessions in this page, return empty array
      if (startIdx >= totalSessionsNum) {
        return [];
      }
      
      // Create an array of contract calls, one for each session
      const calls = [];
      for (let i = 0; i < endIdx - startIdx; i++) {
        const sessionIdx = BigInt(startIdx + i);
        calls.push({
          address: jukebloxContract,
          abi: JukebloxAbi,
          functionName: 'sessions',
          args: [sessionIdx]
        });
      }
      return calls;
    },
    query: {
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
        if (totalSessions === undefined) return undefined;
        
        const totalSessionsNum = Number(totalSessions);
        const nextPageParam = lastPageParam + 50;
        
        return nextPageParam < totalSessionsNum ? nextPageParam : undefined;
      },
      enabled: totalSessions !== undefined
    }
  });
  
  // Process contract data when it changes
  useEffect(() => {
    const processContractSessions = () => {
      if (!sessionData) return;
      
      const contractSessions: ContractSession[] = [];
      
      // Flatten all pages and collect valid results
      sessionData.pages.forEach((page) => {
        page.forEach((result) => {
          if (result.status === 'success') {
            contractSessions.push(result.result as ContractSession);
          }
        });
      });
      
      // Convert contract sessions to our UI format
      const formattedSessions = contractSessions.map((session, index) => {
        // Convert timestamp to date
        const startDate = new Date(Number(session.start) * 1000);
        const endDate = new Date(Number(session.end) * 1000);
        
        return {
          id: `session-${index}`,
          name: `Session #${index}`,
          description: `Active from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          isPublic: true,
          participantCount: Math.floor(Math.random() * 10) + 1, // Random for now
          hostName: 'Contract Owner',
          createdAt: "test"
        };
      });
      
      setSessions(formattedSessions);
      setLoading(false);
    };
    
    if (isLoadingSessionDetails) {
      setLoading(true);
    } else if (isSessionDetailsError) {
      setError('Failed to load session details from contract');
      setLoading(false);
    } else {
      processContractSessions();
    }
  }, [sessionData, isLoadingSessionDetails, isSessionDetailsError]);
  
  // Load more sessions when user scrolls to bottom
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
            Join an existing session or create your own collaborative music experience
          </Typography>
          
          {!isLoadingTotalSessions && !isTotalSessionsError && totalSessions !== undefined && (
            <Chip 
              label={`Total Sessions: ${totalSessions.toString()}`} 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
        
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
          <>
            <Stack spacing={3}>
              {filteredSessions.map(session => (
                <Card 
                  key={session.id}
                  sx={{ 
                    width: '100%',
                    bgcolor: 'background.paper',
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
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
                            label={`Created ${session.createdAt}`} 
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Host: {session.hostName}
                        </Typography>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleJoinSession(session.id)}
                          sx={{ mt: 1 }}
                        >
                          Join
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            
            {hasNextPage && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load More Sessions'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default SessionsListPage; 