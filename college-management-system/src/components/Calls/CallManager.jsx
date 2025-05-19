import { useState, useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import actions safely
let resetCallState = () => ({});
let stopMediaStreams = () => {};

// Try to import call-related modules
try {
  import('../../features/calls/callSlice').then(module => {
    resetCallState = module.resetCallState;
  }).catch(err => {
    console.error('Error importing call slice:', err);
  });

  import('../../utils/webRTCUtils').then(module => {
    stopMediaStreams = module.stopMediaStreams;
  }).catch(err => {
    console.error('Error importing webRTC utils:', err);
  });
} catch (error) {
  console.error('Error setting up call modules:', error);
}

// Lazy load components
const CallDialog = lazy(() => import('./CallDialog').catch(err => {
  console.error('Error loading CallDialog:', err);
  return { default: () => null };
}));

const CallScreen = lazy(() => import('./CallScreen').catch(err => {
  console.error('Error loading CallScreen:', err);
  return { default: () => null };
}));

const CallManager = () => {
  const dispatch = useDispatch();
  let callState = { isIncomingCall: false, isOutgoingCall: false, isCallActive: false };

  try {
    callState = useSelector((state) => state.calls) || callState;
  } catch (error) {
    console.error('Error accessing call state:', error);
  }

  const {
    isIncomingCall,
    isOutgoingCall,
    isCallActive,
    callerId,
    callType,
  } = callState;

  // Local state
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [error, setError] = useState(null);

  // Handle incoming call
  useEffect(() => {
    try {
      if (isIncomingCall) {
        setShowCallDialog(true);
      } else {
        setShowCallDialog(false);
      }
    } catch (err) {
      console.error('Error handling incoming call:', err);
      setError('Error handling incoming call: ' + err.message);
    }
  }, [isIncomingCall]);

  // Handle call active state
  useEffect(() => {
    try {
      if (isCallActive) {
        setShowCallDialog(false);
        setShowCallScreen(true);
      }
    } catch (err) {
      console.error('Error handling active call:', err);
      setError('Error handling active call: ' + err.message);
    }
  }, [isCallActive]);

  // Handle outgoing call
  useEffect(() => {
    try {
      if (isOutgoingCall) {
        setShowCallScreen(true);
      }
    } catch (err) {
      console.error('Error handling outgoing call:', err);
      setError('Error handling outgoing call: ' + err.message);
    }
  }, [isOutgoingCall]);

  // Handle call accept
  const handleCallAccept = () => {
    try {
      setShowCallDialog(false);
      setShowCallScreen(true);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError('Error accepting call: ' + err.message);
    }
  };

  // Handle call reject
  const handleCallReject = () => {
    try {
      setShowCallDialog(false);
    } catch (err) {
      console.error('Error rejecting call:', err);
      setError('Error rejecting call: ' + err.message);
    }
  };

  // Handle call end
  const handleCallEnd = () => {
    try {
      setShowCallScreen(false);
      if (stopMediaStreams) {
        stopMediaStreams();
      }
      if (resetCallState && dispatch) {
        dispatch(resetCallState());
      }
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Error ending call: ' + err.message);
    }
  };

  // If there's an error, don't render anything
  if (error) {
    console.warn('Call functionality disabled due to errors');
    return null;
  }

  return (
    <Suspense fallback={null}>
      {/* Incoming call dialog */}
      <CallDialog
        open={showCallDialog}
        caller={callerId}
        callType={callType}
        onAccept={handleCallAccept}
        onReject={handleCallReject}
      />

      {/* Call screen */}
      <CallScreen
        open={showCallScreen}
        onClose={handleCallEnd}
      />
    </Suspense>
  );
};

export default CallManager;
