import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import {
  getAllConversations,
  setSelectedConversation,
} from '../../features/messages/messageSlice';

const ConversationList = ({ onNewConversation, onSelectConversation }) => {
  const dispatch = useDispatch();
  const { conversations, selectedConversation, isLoading } = useSelector(
    (state) => state.messages
  );
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  
  // Load conversations on mount
  useEffect(() => {
    dispatch(getAllConversations());
  }, [dispatch]);
  
  // Filter conversations when search term changes
  useEffect(() => {
    if (!conversations) return;
    
    if (!searchTerm) {
      setFilteredConversations(conversations);
      return;
    }
    
    const filtered = conversations.filter((conversation) => {
      // For group conversations, search in title
      if (conversation.isGroup) {
        return conversation.title?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      // For one-on-one conversations, search in participant name
      const otherParticipant = getOtherParticipant(conversation, user.user.id);
      return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredConversations(filtered);
  }, [searchTerm, conversations, user]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    dispatch(setSelectedConversation(conversation));
    
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };
  
  // Handle new conversation button click
  const handleNewConversation = () => {
    if (onNewConversation) {
      onNewConversation();
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
      return `${diffMin}m`;
    } else if (diffHour < 24) {
      return `${diffHour}h`;
    } else if (diffDay < 7) {
      return `${diffDay}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Messages</Typography>
          <IconButton color="primary" onClick={handleNewConversation}>
            <AddIcon />
          </IconButton>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search conversations"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredConversations.length > 0 ? (
          <List disablePadding>
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation, user.user.id);
              const isSelected = selectedConversation && selectedConversation._id === conversation._id;
              
              return (
                <ListItem
                  key={conversation._id}
                  button
                  selected={isSelected}
                  onClick={() => handleSelectConversation(conversation)}
                  sx={{
                    borderLeft: conversation.unreadCount ? '4px solid #1976d2' : '4px solid transparent',
                    bgcolor: isSelected ? 'action.selected' : 'inherit',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
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
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '150px',
                          fontWeight: conversation.unreadCount ? 'medium' : 'normal',
                        }}
                      >
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {conversation.lastMessage
                        ? formatDate(conversation.lastMessage.createdAt)
                        : formatDate(conversation.updatedAt)}
                    </Typography>
                    {conversation.unreadCount > 0 && (
                      <Badge
                        badgeContent={conversation.unreadCount}
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {searchTerm
                ? 'No conversations found matching your search'
                : 'No conversations yet'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleNewConversation}
                sx={{ mt: 1 }}
              >
                Start a conversation
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ConversationList;
