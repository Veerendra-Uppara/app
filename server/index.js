const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { initDatabase, saveMessage, getMessages } = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Store connected users (simple in-memory storage for private chat)
const users = new Map();

// Initialize database
let db;
initDatabase()
  .then((database) => {
    db = database;
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', async (userData) => {
    const { username, userId } = userData;
    users.set(socket.id, { username, userId, socketId: socket.id });
    
    // Load message history from database
    if (db) {
      try {
        const messageHistory = await getMessages(db, 100);
        console.log(`Loading ${messageHistory.length} messages for ${username}`);
        socket.emit('messageHistory', messageHistory);
      } catch (err) {
        console.error('Error loading message history:', err);
        socket.emit('messageHistory', []); // Send empty array on error
      }
    } else {
      console.warn('Database not initialized, sending empty message history');
      socket.emit('messageHistory', []);
    }
    
    // Notify user they've joined
    socket.emit('joined', { 
      message: `Welcome ${username}!`, 
      socketId: socket.id 
    });
    
    // Notify other users (for private chat, usually just one other user)
    socket.broadcast.emit('userJoined', { username, userId });
    
    console.log(`${username} joined the chat`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (messageData) => {
    console.log('Received sendMessage event:', messageData);
    const { message, username, userId, timestamp, imageUrl, messageType } = messageData;
    const user = users.get(socket.id);
    
    console.log('Current user for socket:', user);
    console.log('Total users connected:', users.size);
    
    // Use provided username/userId or fallback to stored user
    const finalUsername = username || (user ? user.username : 'Unknown');
    const finalUserId = userId || (user ? user.userId : 'unknown');
    
    // Check if it's an image message or text message
    const isImageMessage = imageUrl && messageType === 'image';
    
    if (!isImageMessage && (!message || !message.trim())) {
      console.log('Empty message, ignoring');
      return;
    }
    
    const messageTimestamp = timestamp || new Date().toISOString();
    const messagePayload = {
      message: message ? message.trim() : null,
      username: finalUsername,
      userId: finalUserId,
      timestamp: messageTimestamp,
      socketId: socket.id,
      imageUrl: imageUrl || null,
      messageType: messageType || 'text'
    };
    
    console.log('Processing message:', { ...messagePayload, imageUrl: imageUrl ? 'present' : 'none' });
    
    // Save message to database
    if (db) {
      try {
        const saved = await saveMessage(db, messagePayload);
        console.log(`Message saved to database (ID: ${saved.id})`);
      } catch (err) {
        console.error('Error saving message to database:', err);
        // Continue anyway - message will still be broadcast
      }
    } else {
      console.warn('Database not initialized, message not saved (but still broadcast)');
    }
    
    // Broadcast message to all connected clients (for private chat)
    console.log('Broadcasting message to all clients');
    io.emit('receiveMessage', messagePayload);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', {
      username: data.username,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`${user.username} disconnected`);
      socket.broadcast.emit('userLeft', { username: user.username });
      users.delete(socket.id);
    }
  });
});

// API route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API route to get message history
app.get('/api/messages', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not initialized' });
    }
    const limit = parseInt(req.query.limit) || 100;
    const messages = await getMessages(db, limit);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Serve React app for all other routes (only if build exists)
const buildPath = path.join(__dirname, '../client/build', 'index.html');
app.get('*', (req, res, next) => {
  // Skip serving React app for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
    return next();
  }
  
  // Only serve build if it exists (for production)
  if (fs.existsSync(buildPath)) {
    res.sendFile(buildPath);
  } else {
    // In development, redirect to client dev server or show message
    res.status(404).json({ 
      error: 'React app not built. Please run: cd client && npm start (for dev) or npm run build (for prod)' 
    });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

