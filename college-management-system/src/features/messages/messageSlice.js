import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '../../services/messageService';

const initialState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  attachments: [],
  uploadedAttachments: [],
  unreadCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all conversations
export const getAllConversations = createAsyncThunk(
  'messages/getAllConversations',
  async (_, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.getAllConversations(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get or create a conversation
export const createOrGetConversation = createAsyncThunk(
  'messages/createOrGetConversation',
  async (conversationData, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.createOrGetConversation(conversationData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get messages for a conversation
export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async ({ conversationId, params }, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.getMessages(conversationId, params, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Send a message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.sendMessage(messageData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark messages as read
export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.markAsRead(conversationId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a message
export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.deleteMessage(messageId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get unread message count
export const getUnreadCount = createAsyncThunk(
  'messages/getUnreadCount',
  async (_, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.getUnreadCount(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Upload message attachments
export const uploadAttachments = createAsyncThunk(
  'messages/uploadAttachments',
  async (files, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.uploadAttachments(files, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get message attachments
export const getAttachments = createAsyncThunk(
  'messages/getAttachments',
  async (messageId, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.getAttachments(messageId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete attachment
export const deleteAttachment = createAsyncThunk(
  'messages/deleteAttachment',
  async (attachmentId, thunkAPI) => {
    try {
      const token = messageService.getToken(thunkAPI.getState());

      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }

      return await messageService.deleteAttachment(attachmentId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a new message (from socket)
export const addMessage = (message) => ({
  type: 'messages/addMessage',
  payload: message,
});

// Update typing status
export const updateTypingStatus = (data) => ({
  type: 'messages/updateTypingStatus',
  payload: data,
});

export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
      };
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    clearAttachments: (state) => {
      state.uploadedAttachments = [];
    },
    addAttachment: (state, action) => {
      state.uploadedAttachments.push(action.payload);
    },
    removeAttachment: (state, action) => {
      state.uploadedAttachments = state.uploadedAttachments.filter(
        attachment => attachment._id !== action.payload
      );
    },
    addMessage: (state, action) => {
      // Add message to messages array if it's for the selected conversation
      if (state.selectedConversation &&
          action.payload.conversation === state.selectedConversation._id) {
        state.messages.unshift(action.payload.message);
      }

      // Update conversation in conversations array
      const index = state.conversations.findIndex(
        (conversation) => conversation._id === action.payload.conversation
      );

      if (index !== -1) {
        // Update last message
        state.conversations[index].lastMessage = action.payload.message;

        // Increment unread count if not the selected conversation
        if (!state.selectedConversation ||
            state.selectedConversation._id !== action.payload.conversation) {
          state.conversations[index].unreadCount += 1;
          state.unreadCount += 1;
        }

        // Move conversation to top of list
        const conversation = state.conversations[index];
        state.conversations.splice(index, 1);
        state.conversations.unshift(conversation);
      }
    },
    updateTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;

      // Update typing status in selected conversation
      if (state.selectedConversation && state.selectedConversation._id === conversationId) {
        state.selectedConversation.typingUsers = state.selectedConversation.typingUsers || {};

        if (isTyping) {
          state.selectedConversation.typingUsers[userId] = true;
        } else {
          delete state.selectedConversation.typingUsers[userId];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all conversations
      .addCase(getAllConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = action.payload.data.conversations;

        // Calculate total unread count
        state.unreadCount = state.conversations.reduce(
          (total, conversation) => total + (conversation.unreadCount || 0),
          0
        );
      })
      .addCase(getAllConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create or get conversation
      .addCase(createOrGetConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const conversation = action.payload.data.conversation;

        // Check if conversation already exists in state
        const existingIndex = state.conversations.findIndex(
          (c) => c._id === conversation._id
        );

        if (existingIndex !== -1) {
          // Update existing conversation
          state.conversations[existingIndex] = conversation;
        } else {
          // Add new conversation
          state.conversations.unshift(conversation);
        }

        // Set as selected conversation
        state.selectedConversation = conversation;
      })
      .addCase(createOrGetConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get messages
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // If it's the first page, replace messages
        if (action.meta.arg.params?.page === 1 || !action.meta.arg.params?.page) {
          state.messages = action.payload.data.messages;
        } else {
          // Otherwise, append messages
          state.messages = [...state.messages, ...action.payload.data.messages];
        }

        state.pagination = action.payload.data.pagination;

        // Update unread count for the conversation
        if (state.selectedConversation) {
          const index = state.conversations.findIndex(
            (c) => c._id === state.selectedConversation._id
          );

          if (index !== -1) {
            // Calculate the difference in unread count
            const oldUnreadCount = state.conversations[index].unreadCount || 0;

            // Update conversation unread count
            state.conversations[index].unreadCount = 0;

            // Update total unread count
            state.unreadCount = Math.max(0, state.unreadCount - oldUnreadCount);
          }
        }
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const message = action.payload.data.message;
        const conversationId = message.conversation;

        // Add message to messages array if it's for the selected conversation
        if (state.selectedConversation && state.selectedConversation._id === conversationId) {
          state.messages.unshift(message);
        }

        // Update conversation in conversations array
        const index = state.conversations.findIndex(
          (conversation) => conversation._id === conversationId
        );

        if (index !== -1) {
          // Update last message
          state.conversations[index].lastMessage = message;

          // Move conversation to top of list
          const conversation = state.conversations[index];
          state.conversations.splice(index, 1);
          state.conversations.unshift(conversation);
        }

        // Clear uploaded attachments after sending
        state.uploadedAttachments = [];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Update unread count for the conversation
        const conversationId = action.meta.arg;
        const index = state.conversations.findIndex(
          (conversation) => conversation._id === conversationId
        );

        if (index !== -1) {
          // Calculate the difference in unread count
          const oldUnreadCount = state.conversations[index].unreadCount || 0;

          // Update conversation unread count
          state.conversations[index].unreadCount = 0;

          // Update total unread count
          state.unreadCount = Math.max(0, state.unreadCount - oldUnreadCount);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Remove message from messages array
        const messageId = action.meta.arg;
        state.messages = state.messages.filter(
          (message) => message._id !== messageId
        );
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get unread count
      .addCase(getUnreadCount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.unreadCount = action.payload.data.count;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Upload attachments
      .addCase(uploadAttachments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Add uploaded files to state
        state.uploadedAttachments = [
          ...state.uploadedAttachments,
          ...action.payload.data.files
        ];
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get attachments
      .addCase(getAttachments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAttachments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attachments = action.payload.data.files;
      })
      .addCase(getAttachments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete attachment
      .addCase(deleteAttachment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Remove attachment from state
        state.uploadedAttachments = state.uploadedAttachments.filter(
          attachment => attachment._id !== action.meta.arg
        );

        state.attachments = state.attachments.filter(
          attachment => attachment._id !== action.meta.arg
        );
      })
      .addCase(deleteAttachment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  reset,
  clearMessages,
  setSelectedConversation,
  clearAttachments,
  addAttachment,
  removeAttachment
} = messageSlice.actions;
export default messageSlice.reducer;
