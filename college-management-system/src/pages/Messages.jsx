import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ConversationList from '../components/Messages/ConversationList';
import MessageList from '../components/Messages/MessageList';
import NewConversation from '../components/Messages/NewConversation';
import ConversationInfo from '../components/Messages/ConversationInfo';
import {
  getAllConversations,
  setSelectedConversation,
} from '../features/messages/messageSlice';

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { conversations, selectedConversation } = useSelector(
    (state) => state.messages
  );

  // Local state
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list', 'messages', 'new', 'info'

  // Load conversations on mount
  useEffect(() => {
    dispatch(getAllConversations());
  }, [dispatch]);

  // Set selected conversation when conversationId changes
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId);

      if (conversation) {
        dispatch(setSelectedConversation(conversation));

        if (isMobile) {
          setMobileView('messages');
        }
      }
    }
  }, [conversationId, conversations, dispatch, isMobile]);

  // Handle new conversation button click
  const handleNewConversation = () => {
    setShowNewConversation(true);

    if (isMobile) {
      setMobileView('new');
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    navigate(`/messages/${conversation._id}`);

    if (isMobile) {
      setMobileView('messages');
    }
  };

  // Handle conversation created
  const handleConversationCreated = (conversation) => {
    setShowNewConversation(false);
    navigate(`/messages/${conversation._id}`);

    if (isMobile) {
      setMobileView('messages');
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (showNewConversation) {
      setShowNewConversation(false);
    } else if (showConversationInfo) {
      setShowConversationInfo(false);
    }

    if (isMobile) {
      setMobileView('list');
    }
  };

  // Handle open user info
  const handleOpenUserInfo = () => {
    setShowConversationInfo(true);

    if (isMobile) {
      setMobileView('info');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Conversation List */}
          {(!isMobile || mobileView === 'list') && (
            <Grid item xs={12} md={3} sx={{ height: '100%', borderRight: '1px solid rgba(0, 0, 0, 0.12)' }}>
              {showNewConversation ? (
                <NewConversation
                  onBack={handleBack}
                  onConversationCreated={handleConversationCreated}
                />
              ) : (
                <ConversationList
                  onNewConversation={handleNewConversation}
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </Grid>
          )}

          {/* Message List */}
          {(!isMobile || mobileView === 'messages') && (
            <Grid item xs={12} md={showConversationInfo ? 5 : 9} sx={{ height: '100%' }}>
              <MessageList
                onBack={handleBack}
                onOpenUserInfo={handleOpenUserInfo}
              />
            </Grid>
          )}

          {/* Conversation Info */}
          {showConversationInfo && selectedConversation && (!isMobile || mobileView === 'info') && (
            <Grid item xs={12} md={4} sx={{ height: '100%', borderLeft: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <ConversationInfo
                conversation={selectedConversation}
                onBack={handleBack}
              />
            </Grid>
          )}

          {/* New Conversation (Mobile) */}
          {isMobile && mobileView === 'new' && (
            <Grid item xs={12} sx={{ height: '100%' }}>
              <NewConversation
                onBack={handleBack}
                onConversationCreated={handleConversationCreated}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Messages;
