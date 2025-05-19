import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Call status
  isIncomingCall: false,
  isOutgoingCall: false,
  isCallActive: false,
  isCallRinging: false,
  
  // Call details
  callType: null, // 'audio' or 'video'
  callerId: null,
  calleeId: null,
  conversationId: null,
  
  // Call rejection/end
  callRejected: false,
  callRejectionReason: null,
  callEnded: false,
  callEndReason: null,
  
  // WebRTC
  remoteSignal: null,
  localStream: null,
  remoteStream: null,
};

export const callSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    // Incoming call
    setIncomingCall: (state, action) => {
      const { callerId, callType, conversationId } = action.payload;
      
      state.isIncomingCall = true;
      state.isCallRinging = true;
      state.callType = callType;
      state.callerId = callerId;
      state.conversationId = conversationId;
      
      // Reset other states
      state.isOutgoingCall = false;
      state.isCallActive = false;
      state.callRejected = false;
      state.callRejectionReason = null;
      state.callEnded = false;
      state.callEndReason = null;
    },
    
    // Outgoing call
    setOutgoingCall: (state, action) => {
      const { calleeId, callType, conversationId } = action.payload;
      
      state.isOutgoingCall = true;
      state.isCallRinging = true;
      state.callType = callType;
      state.calleeId = calleeId;
      state.conversationId = conversationId;
      
      // Reset other states
      state.isIncomingCall = false;
      state.isCallActive = false;
      state.callRejected = false;
      state.callRejectionReason = null;
      state.callEnded = false;
      state.callEndReason = null;
    },
    
    // Call accepted
    setCallAccepted: (state, action) => {
      state.isCallActive = true;
      state.isCallRinging = false;
      
      if (state.isIncomingCall) {
        state.calleeId = action.payload.acceptorId;
      }
    },
    
    // Call rejected
    setCallRejected: (state, action) => {
      state.isCallRinging = false;
      state.callRejected = true;
      state.callRejectionReason = action.payload.reason;
      
      // Reset call states
      state.isIncomingCall = false;
      state.isOutgoingCall = false;
      state.isCallActive = false;
    },
    
    // Call ended
    setCallEnded: (state, action) => {
      state.isCallActive = false;
      state.callEnded = true;
      state.callEndReason = action.payload.reason;
      
      // Reset call states
      state.isIncomingCall = false;
      state.isOutgoingCall = false;
      state.isCallRinging = false;
    },
    
    // WebRTC signal
    setWebRTCSignal: (state, action) => {
      state.remoteSignal = action.payload.signal;
    },
    
    // Set local stream
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    
    // Set remote stream
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    
    // Reset call state
    resetCallState: (state) => {
      return initialState;
    },
  },
});

export const {
  setIncomingCall,
  setOutgoingCall,
  setCallAccepted,
  setCallRejected,
  setCallEnded,
  setWebRTCSignal,
  setLocalStream,
  setRemoteStream,
  resetCallState,
} = callSlice.actions;

export default callSlice.reducer;
