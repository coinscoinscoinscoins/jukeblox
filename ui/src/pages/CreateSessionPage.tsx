import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { jukebloxContract, JukebloxAbi } from '../lib/JukebloxContract';

const CreateSessionPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Initialize with current date and one year later
  const now = new Date();
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  
  // Form state
  const [name, setName] = useState('My Music Session');
  const [startTime, setStartTime] = useState(now.toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(oneYearLater.toISOString().slice(0, 16));
  const [cost, setCost] = useState('1');
  const [error, setError] = useState<string | null>(null);

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

  // Redirect when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      // Wait a moment before redirecting
      const timer = setTimeout(() => {
        navigate('/sessions');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, hash, navigate]);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a session');
      return;
    }
    
    if (!name.trim()) {
      setError('Please provide a session name');
      return;
    }
    
    try {
      setError(null);
      
      // Convert datetime strings to Unix timestamps (seconds)
      const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endUnix = Math.floor(new Date(endTime).getTime() / 1000);
      
      // Convert cost to BigInt
      const costValue = BigInt(cost);
      
      // Call the contract
      writeContract({
        address: jukebloxContract,
        abi: JukebloxAbi,
        functionName: 'createSession',
        args: [BigInt(startUnix), BigInt(endUnix), name, costValue]
      });
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {hash && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Transaction submitted: {hash}
            {isConfirmed ? ' (Confirmed! Redirecting...)' : ' (Waiting for confirmation...)'}
          </Alert>
        )}

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

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Session Schedule
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <TextField
                  label="End Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Stack>
            </Box>

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
                  inputProps: { min: 1, step: 1 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                helperText={`${cost} WEI = ${convertWeiToEth(Number(cost))} ETH`}
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={!name.trim() || isPending || isConfirming}
              sx={{
                py: 2,
              }}
            >
              {isPending || isConfirming ? (
                <><CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> 
                  {isConfirming ? 'Confirming Transaction...' : 'Creating Session...'}
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateSessionPage; 