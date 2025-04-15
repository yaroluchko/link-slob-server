/**
 * LinkSlob Client - Ableton Link client for Creativitas
 * 
 * This client connects to the LinkSlob server and provides an interface
 * for Creativitas to interact with Ableton Link timing information.
 */

class LinkSlobClient {
  /**
   * Create a new LinkSlob client
   * @param {Object} options - Configuration options
   * @param {string} options.serverUrl - URL of the LinkSlob server (default: 'http://localhost:3333')
   * @param {Function} options.onUpdate - Callback for timing updates
   * @param {Function} options.onStatusChange - Callback for connection status changes
   * @param {Function} options.onTransportChange - Callback for transport state changes
   */
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'http://localhost:3333';
    this.onUpdate = options.onUpdate || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onTransportChange = options.onTransportChange || (() => {});
    
    this.socket = null;
    this.isConnected = false;
    this.numPeers = 0;
    this.bpm = 120;
    this.beat = 0;
    this.phase = 0;
    
    this.debug = false;
  }
  
  /**
   * Connect to the LinkSlob server
   * @returns {Promise} - Resolves when connected
   */
  connect() {
    return new Promise((resolve, reject) => {
      // Check if Socket.IO is available
      if (typeof io === 'undefined') {
        const error = new Error('Socket.IO client not found. Make sure to include socket.io-client in your project.');
        this._log('error', error.message);
        reject(error);
        return;
      }
      
      try {
        this._log('Connecting to LinkSlob server at', this.serverUrl);
        
        // Connect to the server
        this.socket = io(this.serverUrl);
        
        // Set up event handlers
        this.socket.on('connect', () => {
          this.isConnected = true;
          this._log('Connected to LinkSlob server');
          this.onStatusChange({ isConnected: true });
          resolve();
        });
        
        this.socket.on('disconnect', () => {
          this.isConnected = false;
          this._log('Disconnected from LinkSlob server');
          this.onStatusChange({ isConnected: false });
        });
        
        this.socket.on('connect_error', (error) => {
          this._log('error', 'Connection error:', error);
          this.onStatusChange({ isConnected: false, error });
          reject(error);
        });
        
        // Handle timing updates
        this.socket.on('link-update', (data) => {
          this.beat = data.beat;
          this.phase = data.phase;
          this.bpm = data.bpm;
          this.numPeers = data.numPeers;
          
          this.onUpdate(data);
        });
        
        // Handle initial status
        this.socket.on('link-status', (status) => {
          this.isConnected = status.isConnected;
          this.numPeers = status.numPeers;
          this.bpm = status.bpm;
          this.beat = status.beat;
          this.phase = status.phase;
          
          this.onStatusChange(status);
        });
        
        // Handle BPM changes
        this.socket.on('bpm-changed', (bpm) => {
          this.bpm = bpm;
          this._log('BPM changed to', bpm);
        });
        
        // Handle transport state changes
        this.socket.on('transport-state', (state) => {
          this._log('Transport state changed to', state);
          this.onTransportChange(state);
        });
      } catch (error) {
        this._log('error', 'Failed to connect to LinkSlob server:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from the LinkSlob server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this._log('Disconnected from LinkSlob server');
    }
  }
  
  /**
   * Set the BPM
   * @param {number} bpm - Beats per minute
   */
  setBpm(bpm) {
    if (this.socket && this.isConnected) {
      this.socket.emit('set-bpm', bpm);
      this._log('Setting BPM to', bpm);
    }
  }
  
  /**
   * Set the beat position
   * @param {number} beat - Beat position
   */
  setBeat(beat) {
    if (this.socket && this.isConnected) {
      this.socket.emit('set-beat', beat);
      this._log('Setting beat to', beat);
    }
  }
  
  /**
   * Start the transport
   */
  start() {
    if (this.socket && this.isConnected) {
      this.socket.emit('transport', 'start');
      this._log('Starting transport');
    }
  }
  
  /**
   * Stop the transport
   */
  stop() {
    if (this.socket && this.isConnected) {
      this.socket.emit('transport', 'stop');
      this._log('Stopping transport');
    }
  }
  
  /**
   * Get the number of connected peers
   * @returns {number} - Number of connected peers
   */
  getNumPeers() {
    return this.numPeers;
  }
  
  /**
   * Get the current BPM
   * @returns {number} - Current BPM
   */
  getBpm() {
    return this.bpm;
  }
  
  /**
   * Get the current beat position
   * @returns {number} - Current beat position
   */
  getBeat() {
    return this.beat;
  }
  
  /**
   * Get the current phase
   * @returns {number} - Current phase
   */
  getPhase() {
    return this.phase;
  }
  
  /**
   * Check if connected to the LinkSlob server
   * @returns {boolean} - True if connected
   */
  isConnectedToServer() {
    return this.isConnected;
  }
  
  /**
   * Enable debug logging
   * @param {boolean} enable - Whether to enable debug logging
   */
  setDebug(enable) {
    this.debug = enable;
  }
  
  /**
   * Log a message if debug is enabled
   * @private
   */
  _log(level, ...args) {
    if (this.debug) {
      if (level === 'error') {
        console.error('[LinkSlob]', ...args);
      } else {
        console.log('[LinkSlob]', ...args);
      }
    }
  }
}

// Export for CommonJS (Node.js) and ES modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = LinkSlobClient;
} else {
  window.LinkSlobClient = LinkSlobClient;
}
