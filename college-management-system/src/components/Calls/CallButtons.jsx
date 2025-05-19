import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallEndIcon from '@mui/icons-material/CallEnd';
import socketService from '../../services/socketService';
import { setOutgoingCall, resetCallState } from '../../features/calls/callSlice';

const CallButtons = ({ recipientId, conversationId }) => {
  const dispatch = useDispatch();
  const [callType, setCallType] = useState(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const { isCallRinging, callRejected, callRejectionReason } = useSelector(
    (state) => state.calls
  );
  
  // Handle audio call
  const handleAudioCall = () => {
    setCallType('audio');
    setIsCallDialogOpen(true);
    
    // Dispatch outgoing call
    dispatch(setOutgoingCall({
      calleeId: recipientId,
      callType: 'audio',
      conversationId,
    }));
    
    // Send call request
    socketService.sendCallRequest(recipientId, 'audio', conversationId);
  };
  
  // Handle video call
  const handleVideoCall = () => {
    setCallType('video');
    setIsCallDialogOpen(true);
    
    // Dispatch outgoing call
    dispatch(setOutgoingCall({
      calleeId: recipientId,
      callType: 'video',
      conversationId,
    }));
    
    // Send call request
    socketService.sendCallRequest(recipientId, 'video', conversationId);
  };
  
  // Handle cancel call
  const handleCancelCall = () => {
    // Send call ended signal
    socketService.endCall(recipientId, 'cancelled');
    
    // Reset call state
    dispatch(resetCallState());
    
    // Close dialog
    setIsCallDialogOpen(false);
  };
  
  // Handle call dialog close
  const handleCallDialogClose = () => {
    if (!isCallRinging) {
      handleCancelCall();
    }
  };

  return (
    <>
      <Box>
        <Tooltip title="Audio call">
          <IconButton onClick={handleAudioCall} color="primary">
            <CallIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Video call">
          <IconButton onClick={handleVideoCall} color="primary">
            <VideocamIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Outgoing call dialog */}
      <Dialog
        open={isCallDialogOpen}
        onClose={handleCallDialogClose}
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
            {callRejected ? 'Call Ended' : 'Calling...'}
          </DialogTitle>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            {callType === 'video' ? 'Video call' : 'Audio call'}
          </Typography>
        </Box>
        
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {callRejected ? (
            <Typography variant="h6" color="error">
              {callRejectionReason === 'declined'
                ? 'Call declined'
                : callRejectionReason === 'timeout'
                ? 'No answer'
                : 'Call failed'}
            </Typography>
          ) : (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1">
                Waiting for answer...
              </Typography>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<CallEndIcon />}
            onClick={handleCancelCall}
            sx={{ borderRadius: 28, px: 3 }}
          >
            {callRejected ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CallButtons;
