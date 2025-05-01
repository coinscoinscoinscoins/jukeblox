import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Switch,
  FormControlLabel,
  Slider,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CreateSessionPage = () => {
  const { spotifyClient, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [cost, setCost] = useState('0.0001');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !spotifyClient) {
      setError('You must be logged in to create a session');
      return;
    }
    
    if (!name.trim()) {
      setError('Please provide a session name');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // TODO: Implement session creation logic
      console.log('Creating session with:', {
        name,
        description,
        isPublic,
        maxParticipants,
        cost,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, navigate to the session detail page
      // For now we'll use a fake ID
      const sessionId = 'session-' + Date.now();
      navigate(`/sessions/${sessionId}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const convertWeiToEth = (wei: number) => {
    return (wei / 10 ** 9).toFixed(9);
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        py: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <Typography 
          variant="h3" 
        >
          Create a New Session
        </Typography>

        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack spacing={4}>
            <TextField
              label="Session Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              placeholder="What's this session about?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Cost per Song Request
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">WEI</InputAdornment>,
                  inputProps: { min: 0, step: "0.0001" }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                helperText={`${cost} WEI = ${convertWeiToEth(Number(cost))} ETH`}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Max Participants: {maxParticipants}
              </Typography>
              <Slider
                value={maxParticipants}
                onChange={(_, value) => setMaxParticipants(value as number)}
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' }
                ]}
                sx={{
                  color: 'primary.main'
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">
                    {isPublic ? 'Public Session' : 'Private Session'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isPublic 
                      ? 'Anyone can find and join this session' 
                      : 'Only people with the link can join'}
                  </Typography>
                </Box>
              }
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              sx={{
                py: 2,
              }}
            >
              {creating ? 'Creating Session...' : 'Create Session'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateSessionPage; 