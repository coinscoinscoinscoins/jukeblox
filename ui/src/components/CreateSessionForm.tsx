import { useState } from 'react';
import { Button, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { jukebloxContract, JukebloxAbi } from '../lib/JukebloxContract';

export default function CreateSessionForm() {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  
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

  const handleCreateSession = () => {
    // Convert datetime strings to Unix timestamps (seconds)
    const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
    const endUnix = Math.floor(new Date(endTime).getTime() / 1000);
    
    writeContract({
      address: jukebloxContract,
      abi: JukebloxAbi,
      functionName: 'createSession',
      args: [BigInt(startUnix), BigInt(endUnix)]
    });
  };
  
  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Create a New JukeBlox Session</Typography>
      
      <TextField
        label="Start Time"
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      
      <TextField
        label="End Time"
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      
      <Button 
        variant="contained" 
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleCreateSession}
        disabled={!startTime || !endTime || isPending || isConfirming}
      >
        {isPending || isConfirming ? (
          <><CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> Creating Session...</>
        ) : isConfirmed ? (
          'Session Created!'
        ) : (
          'Create Session'
        )}
      </Button>
      
      {hash && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Transaction: {hash}
          {isConfirmed && ' (Confirmed)'}
        </Typography>
      )}
    </Box>
  );
} 