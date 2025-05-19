import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUpload from './FileUpload';
import AttachmentList from './AttachmentList';
import CallButtons from '../Calls/CallButtons';
import {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  removeAttachment,
} from '../../features/messages/messageSlice';
import socketService from '../../services/socketService';

const MessageList = ({ onBack, onOpenUserInfo }) => {
  const dispatch = useDispatch();
  const { selectedConversation, messages, pagination, isLoading, uploadedAttachments } = useSelector(
    (state) => state.messages
  );
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      dispatch(getMessages({ conversationId: selectedConversation._id }));
      dispatch(markAsRead(selectedConversation._id));

      // Join conversation room
      socketService.joinConversation(selectedConversation._id);
    }

    return () => {
      // Leave conversation room
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [dispatch, selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle load more messages
  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      dispatch(getMessages({
        conversationId: selectedConversation._id,
        params: { page: pagination.page + 1 },
      }));
    }
  };

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessageText(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTypingStatus(selectedConversation._id, true);
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTypingStatus(selectedConversation._id, false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  // Handle message send
  const handleSendMessage = () => {
    if (!messageText.trim() && uploadedAttachments.length === 0) return;

    dispatch(sendMessage({
      conversationId: selectedConversation._id,
      content: messageText,
      attachments: uploadedAttachments.map(file => file._id),
    }));

    setMessageText('');
    setIsTyping(false);
    setShowAttachments(false);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    socketService.sendTypingStatus(selectedConversation._id, false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle message menu open
  const handleMenuOpen = (event, message) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  // Handle message menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessage(null);
  };

  // Handle message delete
  const handleDeleteMessage = () => {
    if (selectedMessage) {
      dispatch(deleteMessage(selectedMessage._id));
      handleMenuClose();
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Handle user info click
  const handleUserInfoClick = () => {
    if (onOpenUserInfo && selectedConversation) {
      onOpenUserInfo(selectedConversation);
    }
  };

  // Get other participant in a conversation
  const getOtherParticipant = (conversation, currentUserId) => {
    if (!conversation || conversation.isGroup) {
      return null;
    }

    return conversation.participants.find(
      participant => participant._id !== currentUserId
    );
  };

  // Format date
  const formatMessageDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Get typing users
  const getTypingUsers = () => {
    if (!selectedConversation || !selectedConversation.typingUsers) {
      return [];
    }

    return Object.keys(selectedConversation.typingUsers)
      .filter(userId => userId !== user.user.id && selectedConversation.typingUsers[userId]);
  };

  // Get typing text
  const getTypingText = () => {
    const typingUsers = getTypingUsers();

    if (typingUsers.length === 0) {
      return '';
    }

    // Find user names
    const typingUserNames = typingUsers.map(userId => {
      const participant = selectedConversation.participants.find(p => p._id === userId);
      return participant ? participant.name : 'Someone';
    });

    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    } else {
      return 'Several people are typing...';
    }
  };

  // If no conversation is selected, show empty state
  if (!selectedConversation) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Select a conversation to start messaging
        </Typography>
      </Paper>
    );
  }

  const otherParticipant = getOtherParticipant(selectedConversation, user.user.id);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Conversation header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <IconButton sx={{ mr: 1, display: { xs: 'flex', md: 'none' } }} onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>

        <Avatar sx={{ mr: 2 }}>
          {selectedConversation.isGroup ? (
            <GroupIcon />
          ) : (
            otherParticipant?.name?.charAt(0).toUpperCase() || <PersonIcon />
          )}
        </Avatar>

        <Box sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={handleUserInfoClick}>
          <Typography variant="subtitle1" fontWeight="medium">
            {selectedConversation.isGroup
              ? selectedConversation.title || 'Group Chat'
              : otherParticipant?.name || 'Unknown User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedConversation.isGroup
              ? `${selectedConversation.participants.length} members`
              : otherParticipant?.email || ''}
          </Typography>
        </Box>

        {/* Call buttons - only for one-on-one conversations */}
        {!selectedConversation.isGroup && otherParticipant && (
          <CallButtons
            recipientId={otherParticipant._id}
            conversationId={selectedConversation._id}
          />
        )}

        <Tooltip title="Conversation info">
          <IconButton onClick={handleUserInfoClick}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Message list */}
      <Box
        ref={messageListRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
      >
        <div ref={messagesEndRef} />

        {/* Typing indicator */}
        {getTypingUsers().length > 0 && (
          <Box sx={{ p: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {getTypingText()}
            </Typography>
          </Box>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isOwnMessage = message.sender._id === user.user.id;

          return (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                mb: 1,
              }}
            >
              {!isOwnMessage && (
                <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                  {message.sender.name.charAt(0).toUpperCase()}
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isOwnMessage ? 'primary.light' : 'grey.100',
                  color: isOwnMessage ? 'white' : 'text.primary',
                  position: 'relative',
                }}
              >
                {selectedConversation.isGroup && !isOwnMessage && (
                  <Typography variant="caption" fontWeight="bold" display="block">
                    {message.sender.name}
                  </Typography>
                )}

                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                  {message.content}
                </Typography>

                {/* Message attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <AttachmentList
                      attachments={message.attachments}
                      showTitle={false}
                    />
                  </Box>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                  }}
                >
                  {formatMessageDate(message.createdAt)}
                </Typography>

                {isOwnMessage && (
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      color: 'action.active',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'background.default',
                      },
                      width: 24,
                      height: 24,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '.MuiBox-root:hover &': {
                        opacity: 1,
                      },
                    }}
                    onClick={(e) => handleMenuOpen(e, message)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })}

        {/* Load more button */}
        {pagination.page < pagination.pages && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Load more'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Message input */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {/* Attachment preview */}
        {uploadedAttachments.length > 0 && (
          <AttachmentList
            attachments={uploadedAttachments}
            showTitle={false}
            onRemove={(file) => dispatch(removeAttachment(file._id))}
          />
        )}

        <TextField
          fullWidth
          placeholder="Type a message"
          variant="outlined"
          value={messageText}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FileUpload />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() && uploadedAttachments.length === 0}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Message menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteMessage}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default MessageList;
