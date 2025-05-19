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
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { 
  getUnreadCount, 
  getAllConversations,
  setSelectedConversation,
} from '../../features/messages/messageSlice';

const MessageIcon = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { unreadCount, conversations, isLoading } = useSelector(
    (state) => state.messages
  );
  
  // Local state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Load unread count on mount
  useEffect(() => {
    dispatch(getUnreadCount());
  }, [dispatch]);
  
  // Handle icon click
  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget);
    
    // Load conversations if menu is opening
    if (!anchorEl) {
      dispatch(getAllConversations());
    }
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle conversation click
  const handleConversationClick = (conversation) => {
    dispatch(setSelectedConversation(conversation));
    navigate(`/messages/${conversation._id}`);
    handleClose();
  };
  
  // Handle view all messages
  const handleViewAll = () => {
    navigate('/messages');
    handleClose();
  };
  
  // Handle new message
  const handleNewMessage = () => {
    navigate('/messages/new');
    handleClose();
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
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
  
  // Get other participant in a conversation
  const getOtherParticipant = (conversation, currentUserId) => {
    if (conversation.isGroup) {
      return { name: conversation.title || 'Group Chat' };
    }
    
    return conversation.participants.find(
      participant => participant._id !== currentUserId
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleIconClick}
        aria-label="messages"
        aria-controls={open ? 'messages-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <EmailIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="messages-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'messages-button',
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
            Messages
          </Typography>
          <Button
            size="small"
            onClick={handleNewMessage}
          >
            New Message
          </Button>
        </Box>
        
        <Divider />
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length > 0 ? (
          <>
            {conversations.slice(0, 5).map((conversation) => {
              const { user } = useSelector((state) => state.auth);
              const otherParticipant = getOtherParticipant(conversation, user.user.id);
              
              return (
                <MenuItem
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderLeft: conversation.unreadCount ? '3px solid #1976d2' : 'none',
                    bgcolor: conversation.unreadCount ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {conversation.isGroup ? (
                        <GroupIcon />
                      ) : (
                        otherParticipant?.name?.charAt(0).toUpperCase() || <PersonIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        fontWeight={conversation.unreadCount ? 'bold' : 'normal'}
                      >
                        {conversation.isGroup
                          ? conversation.title || 'Group Chat'
                          : otherParticipant?.name || 'Unknown User'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            display: 'block',
                            color: 'text.primary',
                            fontWeight: conversation.unreadCount ? 'medium' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px',
                          }}
                        >
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="span"
                          sx={{ color: 'text.secondary' }}
                        >
                          {conversation.lastMessage
                            ? formatDate(conversation.lastMessage.createdAt)
                            : formatDate(conversation.updatedAt)}
                        </Typography>
                      </>
                    }
                  />
                  {conversation.unreadCount > 0 && (
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </MenuItem>
              );
            })}
            
            <Divider />
            
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" onClick={handleViewAll}>
                View all messages
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleNewMessage}
              sx={{ mt: 1 }}
            >
              Start a conversation
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default MessageIcon;
