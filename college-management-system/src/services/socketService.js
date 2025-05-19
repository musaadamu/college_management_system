import { io } from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../features/notifications/notificationSlice';
import { addMessage, updateTypingStatus } from '../features/messages/messageSlice';
import {
  setIncomingCall,
  setCallAccepted,
  setCallRejected,
  setCallEnded,
  setWebRTCSignal
} from '../features/calls/callSlice';

let socket;

// Initialize socket connection
export const initSocket = (token) => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new connection
  socket = io('http://localhost:5000', {
    auth: {
      token,
    },
  });

  // Setup event listeners
  setupSocketListeners();

  return socket;
};

// Setup socket event listeners
const setupSocketListeners = () => {
  if (!socket) return;

  // Handle connection
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);

    // Authenticate with token
    const token = store.getState().auth.user?.token;
    if (token) {
      socket.emit('authenticate', token);
    }
  });

  // Handle authentication result
  socket.on('authenticated', (data) => {
    console.log('Socket authentication result:', data);
  });

  // Handle new notifications
  socket.on('notification', (notification) => {
    console.log('New notification received:', notification);
    store.dispatch(addNotification(notification));
  });

  // Handle new messages
  socket.on('new-message', (data) => {
    console.log('New message received:', data);
    store.dispatch(addMessage(data));
  });

  // Handle typing status
  socket.on('user-typing', (data) => {
    console.log('User typing status:', data);
    store.dispatch(updateTypingStatus({
      conversationId: data.conversationId,
      userId: data.userId,
      isTyping: data.isTyping,
    }));
  });

  // Handle incoming call
  socket.on('incoming-call', (data) => {
    console.log('Incoming call:', data);
    store.dispatch(setIncomingCall(data));
  });

  // Handle call accepted
  socket.on('call-accepted', (data) => {
    console.log('Call accepted:', data);
    store.dispatch(setCallAccepted(data));
  });

  // Handle call rejected
  socket.on('call-rejected', (data) => {
    console.log('Call rejected:', data);
    store.dispatch(setCallRejected(data));
  });

  // Handle call ended
  socket.on('call-ended', (data) => {
    console.log('Call ended:', data);
    store.dispatch(setCallEnded(data));
  });

  // Handle WebRTC signaling
  socket.on('webrtc-signal', (data) => {
    console.log('WebRTC signal received');
    store.dispatch(setWebRTCSignal(data));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // Handle errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get socket instance
export const getSocket = () => socket;

// Join a conversation room
export const joinConversation = (conversationId) => {
  if (socket) {
    socket.emit('join-conversation', conversationId);
  }
};

// Leave a conversation room
export const leaveConversation = (conversationId) => {
  if (socket) {
    socket.emit('leave-conversation', conversationId);
  }
};

// Send typing status
export const sendTypingStatus = (conversationId, isTyping) => {
  if (socket) {
    socket.emit('typing', { conversationId, isTyping });
  }
};

// Call methods

// Send call request
export const sendCallRequest = (recipientId, callType, conversationId) => {
  if (socket) {
    socket.emit('call-request', { recipientId, callType, conversationId });
  }
};

// Accept call
export const acceptCall = (callerId) => {
  if (socket) {
    socket.emit('call-accepted', { callerId });
  }
};

// Reject call
export const rejectCall = (callerId, reason = 'declined') => {
  if (socket) {
    socket.emit('call-rejected', { callerId, reason });
  }
};

// End call
export const endCall = (peerId, reason = 'ended') => {
  if (socket) {
    socket.emit('call-ended', { peerId, reason });
  }
};

// Send WebRTC signal
export const sendWebRTCSignal = (peerId, signal) => {
  if (socket) {
    socket.emit('webrtc-signal', { peerId, signal });
  }
};

const socketService = {
  initSocket,
  disconnectSocket,
  getSocket,
  joinConversation,
  leaveConversation,
  sendTypingStatus,
  sendCallRequest,
  acceptCall,
  rejectCall,
  endCall,
  sendWebRTCSignal,
};

export default socketService;
