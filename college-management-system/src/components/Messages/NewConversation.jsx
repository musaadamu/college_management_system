import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { getAllUsers } from '../../features/users/userSlice';
import { createOrGetConversation } from '../../features/messages/messageSlice';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`new-conversation-tabpanel-${index}`}
      aria-labelledby={`new-conversation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const NewConversation = ({ onBack, onConversationCreated }) => {
  const dispatch = useDispatch();
  const { users, isLoading: isUsersLoading } = useSelector((state) => state.users);
  const { isLoading: isMessagesLoading } = useSelector((state) => state.messages);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [isGroup, setIsGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Load users on mount
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);
  
  // Filter users when search term changes
  useEffect(() => {
    if (!users) return;
    
    if (!searchTerm) {
      // Exclude current user from the list
      setFilteredUsers(users.filter(user => user._id !== currentUser.user.id));
      return;
    }
    
    const filtered = users.filter(
      user => 
        user._id !== currentUser.user.id && 
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users, currentUser]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setIsGroup(newValue === 1);
  };
  
  // Handle user selection
  const handleUserSelect = (user) => {
    if (isGroup) {
      // For group conversations, toggle user selection
      const isSelected = selectedUsers.some(u => u._id === user._id);
      
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      // For one-on-one conversations, create conversation immediately
      handleCreateConversation(user._id);
    }
  };
  
  // Handle group title change
  const handleGroupTitleChange = (e) => {
    setGroupTitle(e.target.value);
  };
  
  // Handle create conversation
  const handleCreateConversation = (userId) => {
    if (isGroup) {
      // Create group conversation
      if (selectedUsers.length === 0) {
        return; // No users selected
      }
      
      dispatch(createOrGetConversation({
        isGroup: true,
        title: groupTitle || 'Group Chat',
        participants: selectedUsers.map(user => user._id),
      })).then((result) => {
        if (!result.error && onConversationCreated) {
          onConversationCreated(result.payload.data.conversation);
        }
      });
    } else {
      // Create one-on-one conversation
      dispatch(createOrGetConversation({
        userId,
      })).then((result) => {
        if (!result.error && onConversationCreated) {
          onConversationCreated(result.payload.data.conversation);
        }
      });
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  // Check if user is selected
  const isUserSelected = (userId) => {
    return selectedUsers.some(user => user._id === userId);
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <IconButton sx={{ mr: 1 }} onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h6">
          New Conversation
        </Typography>
      </Box>
      
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Direct Message" />
        <Tab label="Group Chat" />
      </Tabs>
      
      {/* Search */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <TextField
          fullWidth
          placeholder="Search users"
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
      
      {/* Tab panels */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isUsersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length > 0 ? (
            <List>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  onClick={() => handleUserSelect(user)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm
                  ? 'No users found matching your search'
                  : 'No users available'}
              </Typography>
            </Box>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Group Title"
            variant="outlined"
            value={groupTitle}
            onChange={handleGroupTitleChange}
            placeholder="Enter group name"
          />
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Select participants:
        </Typography>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 300 }}>
          {isUsersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length > 0 ? (
            <List>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  onClick={() => handleUserSelect(user)}
                  selected={isUserSelected(user._id)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                  />
                  <Checkbox
                    edge="end"
                    checked={isUserSelected(user._id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm
                  ? 'No users found matching your search'
                  : 'No users available'}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCreateConversation()}
            disabled={selectedUsers.length === 0 || isMessagesLoading}
          >
            {isMessagesLoading ? <CircularProgress size={24} /> : 'Create Group'}
          </Button>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default NewConversation;
