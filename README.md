# iDeck

A StreamDeck alternative that uses a website on your phone to send commands to your computer.

## Features

- Control your computer from your phone's web browser
- Add to your iPhone home screen for a fullscreen app-like experience
- Customizable button grid with configurable commands
- Execute shell commands or keyboard shortcuts
- Works over your local network

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. The server will start on port 3000. You'll see a message with the URL to access the web interface.

## Connecting from Your Phone

1. Make sure your phone and computer are on the same network
2. Find your computer's local IP address
3. On your phone, open a web browser and navigate to `http://YOUR_COMPUTER_IP:3000`

## Adding to iPhone Home Screen

1. Open iDeck in Safari on your iPhone
2. Tap the Share icon (rectangle with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it and tap "Add"
5. The app will now appear on your home screen and run in fullscreen mode when opened

## Customizing Buttons

1. Tap the Settings icon (⚙️) at the bottom of the screen
2. Adjust the number of rows and columns as needed
3. Long-press (or right-click) on any button to configure it
4. Set a name, color, and command for the button
5. Save your changes

## Command Types

- **Shell Command**: Execute any command on your computer
- **Keypress**: Simulate keyboard shortcuts

## Security Note

This application runs commands on your computer with the same permissions as the user running the server. Only use it on secure networks and be careful about what commands you configure.

## License

MIT