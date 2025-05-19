const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const { User } = require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const fileRoutes = require('./routes/fileRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const keyRoutes = require('./routes/keyRoutes');

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store io instance in app for use in controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Store user ID for this socket
  let userId = null;

  // Authenticate user and join their room
  socket.on('authenticate', async (token) => {
    try {
      // Verify JWT token (simplified, you should use your actual auth logic)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user) {
        // Store user ID
        userId = user._id.toString();

        // Join user's room (using their ID as room name)
        socket.join(userId);
        console.log(`User ${user.name} authenticated and joined room ${userId}`);

        // Send confirmation
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { success: false, message: 'Authentication failed' });
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('authenticated', { success: false, message: 'Authentication failed' });
    }
  });

  // Handle joining a conversation room
  socket.on('join-conversation', (conversationId) => {
    if (!userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Join conversation room
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${userId} joined conversation room ${conversationId}`);
  });

  // Handle leaving a conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${userId} left conversation room ${conversationId}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ conversationId, isTyping }) => {
    if (!userId) return;

    // Broadcast typing status to conversation room except sender
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      userId,
      isTyping,
    });
  });

  // Handle call signaling

  // Call request
  socket.on('call-request', ({ recipientId, callType, conversationId }) => {
    if (!userId) return;

    console.log(`Call request from ${userId} to ${recipientId}, type: ${callType}`);

    // Send call request to recipient
    io.to(recipientId).emit('incoming-call', {
      callerId: userId,
      callType, // 'audio' or 'video'
      conversationId
    });
  });

  // Call accepted
  socket.on('call-accepted', ({ callerId }) => {
    if (!userId) return;

    console.log(`Call accepted by ${userId} from ${callerId}`);

    // Notify caller that call was accepted
    io.to(callerId).emit('call-accepted', { acceptorId: userId });
  });

  // Call rejected
  socket.on('call-rejected', ({ callerId, reason }) => {
    if (!userId) return;

    console.log(`Call rejected by ${userId} from ${callerId}, reason: ${reason}`);

    // Notify caller that call was rejected
    io.to(callerId).emit('call-rejected', { rejectorId: userId, reason });
  });

  // Call ended
  socket.on('call-ended', ({ peerId, reason }) => {
    if (!userId) return;

    console.log(`Call ended by ${userId} with ${peerId}, reason: ${reason}`);

    // Notify peer that call was ended
    io.to(peerId).emit('call-ended', { enderId: userId, reason });
  });

  // WebRTC signaling
  socket.on('webrtc-signal', ({ peerId, signal }) => {
    if (!userId) return;

    console.log(`WebRTC signal from ${userId} to ${peerId}`);

    // Forward the WebRTC signal to the peer
    io.to(peerId).emit('webrtc-signal', {
      senderId: userId,
      signal
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_management';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount Routes
app.get('/', (req, res) => {
  res.send('College Management System API');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/keys', keyRoutes);

// Error Handler Middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running`);
});
