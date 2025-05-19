import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PersonIcon from '@mui/icons-material/Person';
import { resetCallState } from '../../features/calls/callSlice';
import socketService from '../../services/socketService';
import { 
  getUserMedia, 
  createPeer, 
  addSignalToPeer, 
  stopMediaStreams,
  toggleAudio,
  toggleVideo
} from '../../utils/webRTCUtils';

const CallScreen = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { 
    callType, 
    callerId, 
    calleeId, 
    isOutgoingCall,
    remoteSignal,
    localStream,
    remoteStream,
  } = useSelector((state) => state.calls);
  
  // Local state
  const [peer, setPeer] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  
  // Get peer ID
  const peerId = isOutgoingCall ? calleeId : callerId;
  
  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get user media
        const stream = await getUserMedia(callType === 'video', true);
        
        // Set local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Create peer connection
        const newPeer = createPeer(isOutgoingCall, stream, peerId);
        setPeer(newPeer);
        
        // Start call timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        setIsConnecting(false);
      } catch (error) {
        console.error('Error initializing call:', error);
        handleEndCall();
      }
    };
    
    if (open) {
      initializeCall();
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [open, callType, isOutgoingCall, peerId]);
  
  // Handle remote signal
  useEffect(() => {
    if (peer && remoteSignal) {
      addSignalToPeer(peer, remoteSignal);
    }
  }, [peer, remoteSignal]);
  
  // Set remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      setIsConnecting(false);
    }
  }, [remoteStream]);
  
  // Handle end call
  const handleEndCall = () => {
    // Send end call signal
    socketService.endCall(peerId, 'ended');
    
    // Stop media streams
    stopMediaStreams();
    
    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    // Close peer connection
    if (peer) {
      peer.destroy();
    }
    
    // Reset call state
    dispatch(resetCallState());
    
    // Close dialog
    if (onClose) onClose();
  };
  
  // Handle toggle mute
  const handleToggleMute = () => {
    toggleAudio(!isMuted);
    setIsMuted(!isMuted);
  };
  
  // Handle toggle video
  const handleToggleVideo = () => {
    toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };
  
  // Handle toggle fullscreen
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Format call duration
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleEndCall}
      maxWidth="md"
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          borderRadius: isFullscreen ? 0 : 2,
          overflow: 'hidden',
          height: isFullscreen ? '100%' : 'calc(100vh - 64px)',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Call status */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            borderRadius: 4,
            px: 2,
            py: 0.5,
          }}
        >
          {isConnecting ? (
            <>
              <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
              <Typography variant="body2">Connecting...</Typography>
            </>
          ) : (
            <Typography variant="body2">{formatDuration(callDuration)}</Typography>
          )}
        </Box>
        
        {/* Remote video (full screen) */}
        {callType === 'video' ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                <PersonIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography>Waiting for video...</Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Audio call display
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'primary.dark',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h6">Audio Call</Typography>
            <audio ref={remoteVideoRef} autoPlay />
          </Box>
        )}
        
        {/* Local video (picture-in-picture) */}
        {callType === 'video' && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 16,
              width: 150,
              height: 200,
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'black',
            }}
          >
            {isVideoOff ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'grey.800',
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror effect
                }}
              />
            )}
          </Paper>
        )}
        
        {/* Call controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <IconButton
            color={isMuted ? 'error' : 'default'}
            onClick={handleToggleMute}
            sx={{
              bgcolor: 'white',
              mx: 1,
              '&:hover': { bgcolor: 'grey.200' },
            }}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          
          <IconButton
            color="error"
            onClick={handleEndCall}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              mx: 1,
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            <CallEndIcon />
          </IconButton>
          
          {callType === 'video' && (
            <IconButton
              color={isVideoOff ? 'error' : 'default'}
              onClick={handleToggleVideo}
              sx={{
                bgcolor: 'white',
                mx: 1,
                '&:hover': { bgcolor: 'grey.200' },
              }}
            >
              {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
          )}
          
          <IconButton
            onClick={handleToggleFullscreen}
            sx={{
              bgcolor: 'white',
              mx: 1,
              '&:hover': { bgcolor: 'grey.200' },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CallScreen;
