import axios from 'axios';
import { encryptMessageContent, decryptMessageContent } from './encryptionService';

const API_URL = 'http://localhost:5000/api/messages/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all conversations
const getAllConversations = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'conversations', config);

  // Decrypt last messages if needed
  if (response.data.data && response.data.data.conversations) {
    const conversations = response.data.data.conversations.map(conversation => {
      if (conversation.lastMessage && conversation.lastMessage.isEncrypted && conversation.lastMessage.content) {
        const decryptedContent = decryptMessageContent(
          conversation.lastMessage.content,
          conversation._id
        );
        return {
          ...conversation,
          lastMessage: {
            ...conversation.lastMessage,
            content: decryptedContent
          }
        };
      }
      return conversation;
    });

    return {
      ...response.data,
      data: {
        ...response.data.data,
        conversations,
      },
    };
  }

  return response.data;
};

// Get or create a conversation
const createOrGetConversation = async (conversationData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + 'conversations', conversationData, config);

  // Initialize encryption for the conversation
  if (response.data.data && response.data.data.conversation) {
    const conversation = response.data.data.conversation;

    // Import dynamically to avoid circular dependency
    const { initializeEncryption } = await import('./encryptionService');

    // Initialize encryption with participants
    await initializeEncryption(
      conversation._id,
      conversation.participants.map(p => p._id || p)
    );

    // Decrypt last message if it exists
    if (conversation.lastMessage && conversation.lastMessage.isEncrypted && conversation.lastMessage.content) {
      const decryptedContent = decryptMessageContent(
        conversation.lastMessage.content,
        conversation._id
      );

      return {
        ...response.data,
        data: {
          ...response.data.data,
          conversation: {
            ...conversation,
            lastMessage: {
              ...conversation.lastMessage,
              content: decryptedContent
            }
          }
        }
      };
    }
  }

  return response.data;
};

// Get messages for a conversation
const getMessages = async (conversationId, params = {}, token) => {
  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.page) {
    queryParams.append('page', params.page);
  }

  if (params.limit) {
    queryParams.append('limit', params.limit);
  }

  const queryString = queryParams.toString();
  const url = queryString
    ? `${API_URL}conversations/${conversationId}?${queryString}`
    : `${API_URL}conversations/${conversationId}`;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(url, config);

  // Decrypt messages if needed
  if (response.data.data && response.data.data.messages) {
    const messages = response.data.data.messages.map(message => {
      if (message.isEncrypted && message.content) {
        const decryptedContent = decryptMessageContent(message.content, conversationId);
        return { ...message, content: decryptedContent };
      }
      return message;
    });

    return {
      ...response.data,
      data: {
        ...response.data.data,
        messages,
      },
    };
  }

  return response.data;
};

// Send a message
const sendMessage = async (messageData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Encrypt message content if needed
  if (messageData.content && messageData.content.trim() !== '') {
    const encryptedContent = encryptMessageContent(messageData.content, messageData.conversationId);
    messageData = { ...messageData, content: encryptedContent };
  }

  const response = await axios.post(API_URL, messageData, config);
  return response.data;
};

// Upload message attachments
const uploadAttachments = async (files, token) => {
  const formData = new FormData();

  // Add files to form data
  if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('files', file);
    });
  } else {
    formData.append('files', files);
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.post(API_URL + 'attachments', formData, config);
  return response.data;
};

// Get message attachments
const getAttachments = async (messageId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: messageId ? { messageId } : {},
  };

  const response = await axios.get(API_URL + 'attachments', config);
  return response.data;
};

// Delete attachment
const deleteAttachment = async (attachmentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + 'attachments/' + attachmentId, config);
  return response.data;
};

// Mark messages as read
const markAsRead = async (conversationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + `read/${conversationId}`, {}, config);
  return response.data;
};

// Delete a message
const deleteMessage = async (messageId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + messageId, config);
  return response.data;
};

// Get unread message count
const getUnreadCount = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'unread-count', config);
  return response.data;
};

const messageService = {
  getAllConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  uploadAttachments,
  getAttachments,
  deleteAttachment,
  getToken,
};

export default messageService;
