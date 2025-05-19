import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { 
  getUnreadCount, 
  getAllNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../../features/notifications/notificationSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { unreadCount, notifications, isLoading } = useSelector(
    (state) => state.notifications
  );
  
  // Local state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Load unread count on mount
  useEffect(() => {
    dispatch(getUnreadCount());
  }, [dispatch]);
  
  // Handle bell click
  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget);
    
    // Load notifications if menu is opening
    if (!anchorEl) {
      dispatch(getAllNotifications({ limit: 5 }));
    }
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    
    // Navigate to related content if link exists
    if (notification.link) {
      navigate(notification.link);
    }
    
    handleClose();
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Handle view all notifications
  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <AssignmentIcon fontSize="small" />;
      case 'submission':
        return <SchoolIcon fontSize="small" />;
      case 'grade':
        return <GradeIcon fontSize="small" />;
      case 'announcement':
        return <AnnouncementIcon fontSize="small" />;
      case 'message':
        return <EmailIcon fontSize="small" />;
      case 'system':
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} min ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hr ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleBellClick}
        aria-label="notifications"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderLeft: notification.read ? 'none' : '3px solid #1976d2',
                  bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          display: 'block',
                          color: 'text.primary',
                          fontWeight: notification.read ? 'normal' : 'medium',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ color: 'text.secondary' }}
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{
                    fontWeight: notification.read ? 'normal' : 'bold',
                    variant: 'subtitle2',
                  }}
                />
              </MenuItem>
            ))}
            
            <Divider />
            
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" onClick={handleViewAll}>
                View all notifications
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
