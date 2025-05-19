import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  reset,
} from '../features/notifications/notificationSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { notifications, pagination, isLoading, isError, message } = useSelector(
    (state) => state.notifications
  );
  
  // Local state
  const [page, setPage] = useState(1);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [readFilter, setReadFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Load notifications on mount and when filters change
  useEffect(() => {
    const params = {
      page,
      limit: 10,
    };
    
    if (readFilter !== 'all') {
      params.read = readFilter === 'read';
    }
    
    dispatch(getAllNotifications(params));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, page, readFilter]);
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
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
  };
  
  // Handle delete notification
  const handleDeleteNotification = (id, event) => {
    event.stopPropagation();
    dispatch(deleteNotification(id));
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle read filter change
  const handleReadFilterChange = (event) => {
    setReadFilter(event.target.value);
    setPage(1); // Reset to first page
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(1); // Reset to first page
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <AssignmentIcon />;
      case 'submission':
        return <SchoolIcon />;
      case 'grade':
        return <GradeIcon />;
      case 'announcement':
        return <AnnouncementIcon />;
      case 'message':
        return <EmailIcon />;
      case 'system':
      default:
        return <InfoIcon />;
    }
  };
  
  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'assignment':
        return 'Assignment';
      case 'submission':
        return 'Submission';
      case 'grade':
        return 'Grade';
      case 'enrollment':
        return 'Enrollment';
      case 'announcement':
        return 'Announcement';
      case 'message':
        return 'Message';
      case 'system':
        return 'System';
      default:
        return type;
    }
  };
  
  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'assignment':
        return 'primary';
      case 'submission':
        return 'secondary';
      case 'grade':
        return 'success';
      case 'enrollment':
        return 'info';
      case 'announcement':
        return 'warning';
      case 'message':
        return 'error';
      case 'system':
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Filter notifications by type
  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === typeFilter);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Notifications</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{ mr: 1 }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              Mark all as read
            </Button>
          </Box>
        </Box>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <Box sx={{ p: 2, width: 200 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={readFilter}
                onChange={handleReadFilterChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                label="Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="submission">Submission</MenuItem>
                <MenuItem value="grade">Grade</MenuItem>
                <MenuItem value="enrollment">Enrollment</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="message">Message</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Menu>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        ) : filteredNotifications.length > 0 ? (
          <Paper>
            <List>
              {filteredNotifications.map((notification) => (
                <Box key={notification._id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      borderLeft: notification.read ? 'none' : '4px solid #1976d2',
                      bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle1"
                            component="span"
                            fontWeight={notification.read ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={getTypeLabel(notification.type)}
                            color={getTypeColor(notification.type)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              display: 'block',
                              color: 'text.primary',
                              mt: 0.5,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                          >
                            {formatDate(notification.createdAt)}
                            {notification.sender && ` • From: ${notification.sender.name}`}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
            
            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Pagination
                  count={pagination.pages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No notifications found.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Notifications;
