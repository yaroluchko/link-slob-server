# LinkSlob

LinkSlob is a server that bridges Ableton Link with web applications, specifically designed for Creativitas. It enables web applications to synchronize timing with Ableton Link-enabled applications and devices.

## Features

- Real-time synchronization with Ableton Link
- WebSocket communication via Socket.IO
- BPM, beat, and phase synchronization
- Transport state notifications
- Easy integration with web applications

## Requirements

- Node.js (v14 or later recommended)
- npm (v6 or later)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/LinkSlob.git
cd LinkSlob

# Install dependencies
npm install
```

## Usage

### Starting the Server

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

The server will start on port 3333 by default. You can change this by setting the `PORT` environment variable.

### Client Integration

To use LinkSlob in your web application, include the Socket.IO client library and the LinkSlob client:

```html
<!-- Include Socket.IO client -->
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

<!-- Include LinkSlob client -->
<script src="path/to/client.js"></script>

<script>
  // Create a LinkSlob client
  const linkClient = new LinkSlobClient({
    serverUrl: 'http://localhost:3333',
    onUpdate: (data) => {
      console.log('Link update:', data.beat, data.phase, data.bpm);
      // Update your application's timing here
    },
    onStatusChange: (status) => {
      console.log('Link status changed:', status);
    },
    onTransportChange: (state) => {
      console.log('Transport state changed:', state);
    }
  });

  // Connect to the LinkSlob server
  linkClient.connect().then(() => {
    console.log('Connected to LinkSlob server');
  }).catch(error => {
    console.error('Failed to connect:', error);
  });

  // Control methods
  function setBpm(bpm) {
    linkClient.setBpm(bpm);
  }

  function startTransport() {
    linkClient.start();
  }

  function stopTransport() {
    linkClient.stop();
  }
</script>
```

## API

### Server API

- `GET /status` - Get the current status of the LinkSlob server

### Client API

#### Constructor

```javascript
const linkClient = new LinkSlobClient(options);
```

Options:
- `serverUrl` (string): URL of the LinkSlob server (default: 'http://localhost:3333')
- `onUpdate` (function): Callback for timing updates
- `onStatusChange` (function): Callback for connection status changes
- `onTransportChange` (function): Callback for transport state changes

#### Methods

- `connect()`: Connect to the LinkSlob server
- `disconnect()`: Disconnect from the LinkSlob server
- `setBpm(bpm)`: Set the BPM
- `setBeat(beat)`: Set the beat position
- `start()`: Start the transport
- `stop()`: Stop the transport
- `getNumPeers()`: Get the number of connected peers
- `getBpm()`: Get the current BPM
- `getBeat()`: Get the current beat position
- `getPhase()`: Get the current phase
- `isConnectedToServer()`: Check if connected to the LinkSlob server
- `setDebug(enable)`: Enable or disable debug logging

## Integration with Creativitas

To integrate LinkSlob with Creativitas, you'll need to:

1. Start the LinkSlob server
2. Include the LinkSlob client in your Creativitas project
3. Update the AbletonLinkManager.js file to use the LinkSlob client instead of directly using the abletonlink package

## License

MIT
