import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';

const ConversationInfo = ({ conversation, onBack }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Handle back button click
  const handleBack = () => {
    if (onBack) {
      onBack();
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
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const otherParticipant = getOtherParticipant(conversation, currentUser.user.id);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <IconButton sx={{ mr: 1 }} onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h6">
          {conversation.isGroup ? 'Group Info' : 'Contact Info'}
        </Typography>
      </Box>
      
      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {/* Profile section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
            {conversation.isGroup ? (
              <GroupIcon sx={{ fontSize: 40 }} />
            ) : (
              otherParticipant?.name?.charAt(0).toUpperCase() || <PersonIcon sx={{ fontSize: 40 }} />
            )}
          </Avatar>
          
          <Typography variant="h6" align="center">
            {conversation.isGroup
              ? conversation.title || 'Group Chat'
              : otherParticipant?.name || 'Unknown User'}
          </Typography>
          
          {!conversation.isGroup && otherParticipant && (
            <Typography variant="body2" color="text.secondary" align="center">
              {otherParticipant.email}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Contact details or group members */}
        {conversation.isGroup ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              {conversation.participants.length} Members
            </Typography>
            
            <List>
              {conversation.participants.map((participant) => (
                <ListItem key={participant._id}>
                  <ListItemAvatar>
                    <Avatar>
                      {participant.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={participant.name}
                    secondary={
                      <>
                        {participant.email}
                        {participant._id === conversation.groupAdmin?._id && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              ml: 1,
                              color: 'primary.main',
                              fontWeight: 'bold',
                            }}
                          >
                            Admin
                          </Typography>
                        )}
                        {participant._id === currentUser.user.id && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              ml: 1,
                              color: 'text.secondary',
                              fontStyle: 'italic',
                            }}
                          >
                            You
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : otherParticipant ? (
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <EmailIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Email"
                secondary={otherParticipant.email}
              />
            </ListItem>
            
            {otherParticipant.role && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <SchoolIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Role"
                  secondary={otherParticipant.role.charAt(0).toUpperCase() + otherParticipant.role.slice(1)}
                />
              </ListItem>
            )}
            
            {otherParticipant.studentId && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <SchoolIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Student ID"
                  secondary={otherParticipant.studentId}
                />
              </ListItem>
            )}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            No contact information available
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Conversation details */}
        <Typography variant="subtitle1" gutterBottom>
          Conversation Details
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Created"
              secondary={formatDate(conversation.createdAt)}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="Last Activity"
              secondary={formatDate(conversation.updatedAt)}
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default ConversationInfo;
