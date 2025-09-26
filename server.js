const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const { exec } = require('child_process');
const os = require('os');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected clients and system monitoring intervals
const clients = new Set();
const systemMonitoringIntervals = new Map();

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
        // This is a placeholder - actual implementation will depend on the specific needs
        console.log(`Keypress: ${JSON.stringify(command.keys)}`);
        socket.emit('commandResult', { success: true });
        break;
        
      case 'media':
        // Handle media control commands
        console.log(`Media control: ${command.action}`);
        
        // Map media actions to PowerShell commands
        const mediaCommands = {
          'play': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xB3)',  // Play/Pause
          'pause': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xB3)', // Play/Pause
          'stop': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xB2)',  // Stop
          'prev': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xB1)',  // Previous Track
          'next': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xB0)',  // Next Track
          'volup': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xAF)', // Volume Up
          'voldown': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xAE)', // Volume Down
          'mute': '(New-Object -ComObject WScript.Shell).SendKeys([char]0xAD)' // Volume Mute
        };
        
        if (mediaCommands[command.action]) {
          exec(`powershell -command "${mediaCommands[command.action]}"`, (error) => {
            if (error) {
              console.error(`Error executing media command: ${error}`);
              socket.emit('commandResult', { success: false, error: error.message });
              return;
            }
            socket.emit('commandResult', { success: true });
          });
        } else {
          socket.emit('commandResult', { success: false, error: 'Unknown media action' });
        }
        break;
        
      case 'app':
        // Handle application launching
        console.log(`Launching application: ${command.appPath}`);
        
        if (command.appPath) {
          const appCommand = command.appArgs ? 
            `"${command.appPath}" ${command.appArgs}` : 
            `"${command.appPath}"`;
          
          exec(appCommand, (error) => {
            if (error) {
              console.error(`Error launching application: ${error}`);
              socket.emit('commandResult', { success: false, error: error.message });
              return;
            }
            socket.emit('commandResult', { success: true });
          });
        } else {
          socket.emit('commandResult', { success: false, error: 'No application path specified' });
        }
        break;
        
      case 'system':
        // Handle system monitoring
        console.log(`System monitoring: ${command.metric}`);
        
        // Clear existing interval for this socket and metric if it exists
        const intervalKey = `${socket.id}-${command.metric}`;
        if (systemMonitoringIntervals.has(intervalKey)) {
          clearInterval(systemMonitoringIntervals.get(intervalKey));
        }
        
        // Function to get and emit system data
        const emitSystemData = () => {
          switch(command.metric) {
            case 'cpu':
              // Get CPU usage
              const cpus = os.cpus();
              let totalIdle = 0;
              let totalTick = 0;
              
              cpus.forEach(cpu => {
                for (type in cpu.times) {
                  totalTick += cpu.times[type];
                }
                totalIdle += cpu.times.idle;
              });
              
              const idle = totalIdle / cpus.length;
              const total = totalTick / cpus.length;
              const usage = 100 - ~~(100 * idle / total);
              
              socket.emit('systemData', { metric: 'cpu', value: `${usage}%` });
              break;
              
            case 'memory':
              const totalMem = os.totalmem();
              const freeMem = os.freemem();
              const usedMem = totalMem - freeMem;
              const memUsage = Math.round((usedMem / totalMem) * 100);
              
              socket.emit('systemData', { metric: 'memory', value: `${memUsage}%` });
              break;
              
            case 'network':
              // Network monitoring would require additional libraries
              // For now, just return a placeholder
              socket.emit('systemData', { metric: 'network', value: 'N/A' });
              break;
              
            case 'disk':
              // Disk usage monitoring would require additional libraries
              // For now, just return a placeholder
              socket.emit('systemData', { metric: 'disk', value: 'N/A' });
              break;
              
            default:
              socket.emit('commandResult', { success: false, error: 'Unknown system metric' });
              return;
          }
        };
        
        // Emit initial data
        emitSystemData();
        
        // Set up periodic updates every 2 seconds
        const interval = setInterval(emitSystemData, 2000);
        systemMonitoringIntervals.set(intervalKey, interval);
        
        socket.emit('commandResult', { success: true });
        break;

      default:
        socket.emit('commandResult', { success: false, error: 'Unknown command type' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clients.delete(socket.id);
    
    // Clear all system monitoring intervals for this socket
    for (const [key, interval] of systemMonitoringIntervals.entries()) {
      if (key.startsWith(socket.id)) {
        clearInterval(interval);
        systemMonitoringIntervals.delete(key);
      }
    }
    
    io.emit('clientCount', clients.size);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`iDeck server running on port ${PORT}`);
  console.log(`Access the web interface at http://localhost:${PORT}`);
  console.log('To connect from your phone, use your computer\'s local IP address');
});