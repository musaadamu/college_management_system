// Import dependencies with error handling
let Peer = null;
try {
  // Dynamic import for simple-peer
  import('simple-peer').then(module => {
    Peer = module.default;
  }).catch(err => {
    console.error('Error importing simple-peer:', err);
  });
} catch (error) {
  console.error('Error setting up WebRTC:', error);
}

import socketService from '../services/socketService';
import { store } from '../store';
import {
  setLocalStream,
  setRemoteStream,
  setCallEnded
} from '../features/calls/callSlice';

// Get user media (audio/video)
export const getUserMedia = async (video = true, audio = true) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video,
      audio
    });

    // Store local stream in Redux
    store.dispatch(setLocalStream(stream));

    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

// Create a peer connection
export const createPeer = (initiator, stream, peerId) => {
  try {
    // Check if Peer is available
    if (!Peer) {
      console.error('Peer library not loaded');
      throw new Error('WebRTC not available');
    }

    const peer = new Peer({
      initiator,
      stream,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    // Handle signals
    peer.on('signal', (signal) => {
      socketService.sendWebRTCSignal(peerId, signal);
    });

    // Handle stream
    peer.on('stream', (remoteStream) => {
      store.dispatch(setRemoteStream(remoteStream));
    });

    // Handle close
    peer.on('close', () => {
      handlePeerClose(peerId);
    });

    // Handle errors
    peer.on('error', (err) => {
      console.error('Peer error:', err);
      handlePeerClose(peerId);
    });

    return peer;
  } catch (error) {
    console.error('Error creating peer:', error);
    throw error;
  }
};

// Add signal to peer
export const addSignalToPeer = (peer, signal) => {
  try {
    peer.signal(signal);
  } catch (error) {
    console.error('Error adding signal to peer:', error);
  }
};

// Handle peer close
const handlePeerClose = (peerId) => {
  store.dispatch(setCallEnded({
    enderId: peerId,
    reason: 'disconnected'
  }));

  // Clean up streams
  const { localStream, remoteStream } = store.getState().calls;

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }
};

// Stop media streams
export const stopMediaStreams = () => {
  const { localStream, remoteStream } = store.getState().calls;

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }
};

// Toggle audio
export const toggleAudio = (enabled) => {
  const { localStream } = store.getState().calls;

  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

// Toggle video
export const toggleVideo = (enabled) => {
  const { localStream } = store.getState().calls;

  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};
