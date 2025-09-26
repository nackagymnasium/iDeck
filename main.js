const { app, Tray, Menu, dialog } = require('electron');
const path = require('path');
const http = require('http');

// Import server functionality
let server = null;
let serverInstance = null;
let tray = null;
let serverPort = 3000;

// Function to get all local IP addresses
function getLocalIPs() {
  const interfaces = require('os').networkInterfaces();
  const addresses = [];
  
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  
  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

// Check if server is running
function checkServerStatus(callback) {
  http.get(`http://localhost:${serverPort}`, (res) => {
    callback(res.statusCode === 200);
  }).on('error', () => {
    callback(false);
  });
}

// Start the server
function startServer() {
  if (serverInstance) {
    dialog.showMessageBox({
      type: 'info',
      message: 'Server is already running',
      buttons: ['OK']
    });
    return;
  }

  try {
    // Import and start the server directly
    const express = require('express');
    const socketio = require('socket.io');
    const { GlobalKeyboardListener } = require('node-global-key-listener');
    const { exec } = require('child_process');

    // Initialize Express app (renamed to avoid conflict with Electron app)
    const expressApp = express();
    server = require('http').createServer(expressApp);
    const io = socketio(server);

    // Serve static files from the public directory
    expressApp.use(express.static(path.join(__dirname, 'public')));

    // Store connected clients
    const clients = new Set();

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      clients.add(socket.id);
      
      // Send current number of connected clients
      io.emit('clientCount', clients.size);
      
      // Handle command execution
      socket.on('executeCommand', (command) => {
        console.log(`Executing command: ${command.type}`);
        
        switch(command.type) {
          case 'shell':
            // Execute shell command
            if (command.command) {
              exec(command.command, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error executing command: ${error}`);
                  socket.emit('commandResult', { success: false, error: error.message });
                  return;
                }
                socket.emit('commandResult', { success: true, output: stdout });
              });
            }
            break;
            
          case 'keypress':
            // Handle keypress events
            console.log(`Keypress: ${JSON.stringify(command.keys)}`);
            socket.emit('commandResult', { success: true });
            break;
            
          default:
            socket.emit('commandResult', { success: false, error: 'Unknown command type' });
        }
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        clients.delete(socket.id);
        io.emit('clientCount', clients.size);
      });
    });

    // Start the server
    serverInstance = server.listen(serverPort, () => {
      console.log(`iDeck server running on port ${serverPort}`);
      console.log(`Access the interface at: http://localhost:${serverPort}`);
      updateTray();
    });

  } catch (error) {
    console.error('Error starting server:', error);
    dialog.showErrorBox('Server Error', `Failed to start server: ${error.message}`);
  }
}

// Stop the server
function stopServer() {
  if (!serverInstance) {
    dialog.showMessageBox({
      type: 'info',
      message: 'Server is not running',
      buttons: ['OK']
    });
    return;
  }

  serverInstance.close(() => {
    console.log('Server stopped');
    serverInstance = null;
    server = null;
    updateTray();
  });
}

// Update tray icon and menu
function updateTray() {
  if (!tray) return;

  // Check if server is running
  const isRunning = serverInstance !== null;
  
  // Update tray icon (you can change this to different icons if you have them)
  const iconPath = path.join(__dirname, 'public', 'images', 'icon-192x192.png');
  tray.setImage(iconPath);
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'iDeck Server',
      type: 'normal',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: isRunning ? '🟢 Server Running' : '🔴 Server Stopped',
      type: 'normal',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: isRunning ? 'Stop Server' : 'Start Server',
      type: 'normal',
      click: isRunning ? stopServer : startServer
    },
    {
      label: 'Open Web Interface',
      type: 'normal',
      enabled: isRunning,
      click: () => {
        require('electron').shell.openExternal(`http://localhost:${serverPort}`);
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        if (serverInstance) {
          serverInstance.close(() => {
            app.quit();
          });
        } else {
          app.quit();
        }
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip(isRunning ? 'iDeck Server - Running' : 'iDeck Server - Stopped');
}

// When Electron has finished initialization
app.on('ready', () => {
  // Create the tray icon
  tray = new Tray(path.join(__dirname, 'public', 'images', 'icon-192x192.png'));
  
  // Initial tray setup
  updateTray();
  
  // Start server automatically
  startServer();
});

// Quit when all windows are closed (not applicable for tray apps, but good practice)
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app activation
app.on('activate', () => {
  // Nothing to do for tray apps
});

// Prevent multiple instances (updated for newer Electron versions)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window instead
    // For tray apps, we don't need to do anything special
  });
}