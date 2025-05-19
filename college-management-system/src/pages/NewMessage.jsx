import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
} from '@mui/material';
import NewConversation from '../components/Messages/NewConversation';

const NewMessage = () => {
  const navigate = useNavigate();
  
  // Handle back button click
  const handleBack = () => {
    navigate('/messages');
  };
  
  // Handle conversation created
  const handleConversationCreated = (conversation) => {
    navigate(`/messages/${conversation._id}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
        <NewConversation
          onBack={handleBack}
          onConversationCreated={handleConversationCreated}
        />
      </Paper>
    </Container>
  );
};

export default NewMessage;
