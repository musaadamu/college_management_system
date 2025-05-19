import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from '../../features/auth/authSlice';
// Import memoized selectors
import { selectUser } from '../../selectors';

// Create simple fallback components
const FallbackNotificationBell = () => null;
const FallbackMessageIcon = () => null;

// Dynamically import components
let NotificationBell = FallbackNotificationBell;
let MessageIcon = FallbackMessageIcon;
let socketService = { initSocket: () => {}, disconnectSocket: () => {} };

// Try to import components
try {
  import('../Notifications/NotificationBell')
    .then(module => { NotificationBell = module.default; })
    .catch(err => console.error('Error loading NotificationBell:', err));

  import('../Messages/MessageIcon')
    .then(module => { MessageIcon = module.default; })
    .catch(err => console.error('Error loading MessageIcon:', err));

  import('../../services/socketService')
    .then(module => { socketService = module.default; })
    .catch(err => console.error('Error loading socketService:', err));
} catch (error) {
  console.error('Error importing components:', error);
}

const Header = ({ toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  // Get user with memoized selector
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initialize socket connection when user is logged in
  useEffect(() => {
    try {
      if (user?.token) {
        socketService.initSocket(user.token);
      }

      return () => {
        socketService.disconnectSocket();
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      setError('Error initializing socket');
    }
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    try {
      dispatch(logout());
      navigate('/login');
      handleClose();
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Error logging out');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // If there's an error, render a simplified header
  if (error) {
    return (
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            College Management System
          </Typography>
          <Button color="inherit" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar>
        {user && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          College Management System
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MessageIcon />
            <NotificationBell />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user?.user?.name ? user.user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
