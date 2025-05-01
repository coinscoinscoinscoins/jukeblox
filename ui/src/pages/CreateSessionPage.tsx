import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField,
  Button, 
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CreateSessionPage = () => {
  const { spotifyClient, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
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
        maxParticipants
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

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 5 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Create a New Session
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Session Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  placeholder="What's this session about?"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="visibility-label">Visibility</InputLabel>
                  <Select
                    labelId="visibility-label"
                    value={isPublic ? 'public' : 'private'}
                    label="Visibility"
                    onChange={(e: SelectChangeEvent) => setIsPublic(e.target.value === 'public')}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                  <FormHelperText>
                    {isPublic 
                      ? 'Anyone can find and join this session' 
                      : 'Only people with the link can join'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="max-participants-label">Max Participants</InputLabel>
                  <Select
                    labelId="max-participants-label"
                    value={maxParticipants.toString()}
                    label="Max Participants"
                    onChange={(e: SelectChangeEvent) => setMaxParticipants(Number(e.target.value))}
                  >
                    {[5, 10, 15, 20, 25, 30, 50, 100].map((num) => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Maximum number of people who can join
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    type="submit"
                    disabled={creating || !name.trim()}
                    sx={{ px: 4 }}
                  >
                    {creating ? 'Creating...' : 'Create Session'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CreateSessionPage; 