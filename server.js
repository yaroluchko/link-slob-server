/**
 * LinkSlob - Ableton Link server for Creativitas
 * 
 * This server creates a bridge between Ableton Link and web applications
 * using Socket.IO to communicate timing information.
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const abletonlink = require('abletonlink');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS for cross-origin requests
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Use port from environment variables for cloud deployment
const PORT = process.env.PORT || 3333;

// Enable CORS for Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initialize Ableton Link
const link = new abletonlink();
let updateInterval = null;
let connectedClients = 0;

// Default update interval in milliseconds
const DEFAULT_UPDATE_INTERVAL = 50;

// Store the last values to avoid sending duplicate data
let lastBeat = 0;
let lastPhase = 0;
let lastBpm = 120;

// Serve static files from the public directory
app.use(express.static('public'));

// Simple status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    numPeers: link.numPeers,
    bpm: link.bpm,
    connectedClients
  });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  connectedClients++;
  
  // Start the update interval if this is the first client
  if (connectedClients === 1) {
    startLinkUpdates();
  }
  
  // Send initial status to the client
  socket.emit('link-status', {
    isConnected: true,
    numPeers: link.numPeers,
    bpm: link.bpm,
    beat: link.beat,
    phase: link.phase
  });
  
  // Handle client requests to change BPM
  socket.on('set-bpm', (bpm) => {
    if (typeof bpm === 'number' && bpm > 0) {
      link.bpm = bpm;
      console.log(`BPM set to ${bpm}`);
      
      // Broadcast the BPM change to all clients
      io.emit('bpm-changed', bpm);
    }
  });
  
  // Handle client requests to set beat position
  socket.on('set-beat', (beat) => {
    if (typeof beat === 'number' && beat >= 0) {
      link.beat = beat;
      console.log(`Beat set to ${beat}`);
    }
  });
  
  // Handle client requests to start/stop transport
  socket.on('transport', (command) => {
    if (command === 'start') {
      // In Ableton Link, we don't directly control transport
      // but we can notify other clients
      io.emit('transport-state', 'started');
    } else if (command === 'stop') {
      io.emit('transport-state', 'stopped');
    }
  });
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    connectedClients--;
    
    // Stop the update interval if no clients are connected
    if (connectedClients === 0) {
      stopLinkUpdates();
    }
  });
});

/**
 * Start sending Ableton Link updates to connected clients
 */
function startLinkUpdates() {
  if (updateInterval === null) {
    console.log('Starting Ableton Link updates');
    
    // Enable Ableton Link
    link.isLinkEnable = true;
    
    // Start the update timer
    link.startUpdate(DEFAULT_UPDATE_INTERVAL, (beat, phase, bpm) => {
      // Only send updates if values have changed significantly or if there are peers
      const hasPeers = link.numPeers > 0;
      const beatChanged = Math.abs(beat - lastBeat) > 0.01;
      const phaseChanged = Math.abs(phase - lastPhase) > 0.01;
      const bpmChanged = Math.abs(bpm - lastBpm) > 0.1;
      
      if (beatChanged || phaseChanged || bpmChanged || hasPeers) {
        // Update last values
        lastBeat = beat;
        lastPhase = phase;
        lastBpm = bpm;
        
        // Send update to all connected clients
        io.emit('link-update', {
          beat,
          phase,
          bpm,
          numPeers: link.numPeers
        });
      }
    });
  }
}

/**
 * Stop sending Ableton Link updates
 */
function stopLinkUpdates() {
  if (updateInterval !== null) {
    console.log('Stopping Ableton Link updates');
    link.stopUpdate();
    updateInterval = null;
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`LinkSlob server running on port ${PORT}`);
  console.log(`Ableton Link initialized with BPM: ${link.bpm}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down LinkSlob server...');
  stopLinkUpdates();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
