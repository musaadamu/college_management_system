import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CssBaseline, Typography } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
// Import components with dynamic imports
import { lazy, Suspense } from 'react';
// Import memoized selectors
import { selectUser } from '../../selectors';

// Lazy load CallManager
const CallManager = lazy(() => import('../Calls/CallManager').catch(err => {
  console.error('Error loading CallManager:', err);
  return { default: () => null };
}));

// Import generateKeys action with fallback
let generateKeysAction = () => {};
try {
  // Try dynamic import first
  import('../../features/keys/keySlice')
    .then(module => {
      generateKeysAction = module.generateKeys;
    })
    .catch(err => {
      console.error('Error importing keySlice:', err);
    });
} catch (error) {
  console.error('Error setting up key generation:', error);
}

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  // Get user with memoized selector
  const user = useSelector(selectUser);
  const [error, setError] = useState(null);

  // Initialize encryption keys when user logs in
  useEffect(() => {
    if (user) {
      try {
        // Check if generateKeysAction is available
        if (generateKeysAction && typeof generateKeysAction === 'function') {
          dispatch(generateKeysAction());
        }
      } catch (err) {
        console.error('Error generating keys:', err);
        setError('Error generating encryption keys: ' + err.message);
      }
    }
  }, [dispatch, user]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} toggleDrawer={toggleDrawer} />
      {user && <Sidebar open={open} toggleDrawer={toggleDrawer} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? 240 : 0}px)` },
          ml: { sm: open ? '240px' : 0 },
          mt: '64px',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Outlet />
        )}
      </Box>

      {/* Call manager */}
      {user && (
        <Suspense fallback={null}>
          <CallManager />
        </Suspense>
      )}
    </Box>
  );
};

export default MainLayout;
