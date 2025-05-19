import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  CircularProgress,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';
import socketService from '../../services/socketService';
import { resetCallState } from '../../features/calls/callSlice';

const CallDialog = ({ open, caller, callType, onAccept, onReject }) => {
  const dispatch = useDispatch();
  const [callerInfo, setCallerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { users } = useSelector((state) => state.users);
  
  // Find caller info
  useEffect(() => {
    if (caller && users) {
      const user = users.find(user => user._id === caller);
      if (user) {
        setCallerInfo(user);
      }
      setLoading(false);
    }
  }, [caller, users]);
  
  // Handle accept call
  const handleAccept = () => {
    socketService.acceptCall(caller);
    if (onAccept) onAccept();
  };
  
  // Handle reject call
  const handleReject = () => {
    socketService.rejectCall(caller, 'declined');
    dispatch(resetCallState());
    if (onReject) onReject();
  };
  
  // Auto-reject call after 30 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        socketService.rejectCall(caller, 'timeout');
        dispatch(resetCallState());
        if (onReject) onReject();
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [open, caller, dispatch, onReject]);

  return (
    <Dialog
      open={open}
      onClose={handleReject}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          textAlign: 'center',
        }}
      >
        <DialogTitle sx={{ color: 'white', pb: 0 }}>
          Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
        </DialogTitle>
        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
          {callType === 'video' ? 'Video call from' : 'Audio call from'}
        </Typography>
      </Box>
      
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        {loading ? (
          <CircularProgress />
        ) : callerInfo ? (
          <>
            <Avatar
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            >
              {callerInfo.name?.charAt(0).toUpperCase() || <PersonIcon />}
            </Avatar>
            <Typography variant="h6">{callerInfo.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {callerInfo.email}
            </Typography>
          </>
        ) : (
          <>
            <Avatar
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            >
              <PersonIcon />
            </Avatar>
            <Typography variant="h6">Unknown Caller</Typography>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-around', pb: 3 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<CallEndIcon />}
          onClick={handleReject}
          sx={{ borderRadius: 28, px: 3 }}
        >
          Decline
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={callType === 'video' ? <VideocamIcon /> : <CallIcon />}
          onClick={handleAccept}
          sx={{ borderRadius: 28, px: 3 }}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CallDialog;
