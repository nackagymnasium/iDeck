// Icon Library for iDeck Buttons
const ICON_LIBRARY = {
    // System & Computer
    system: {
        name: "System & Computer",
        icons: [
            { name: "Computer", emoji: "💻", keywords: ["computer", "laptop", "pc"] },
            { name: "Desktop", emoji: "🖥️", keywords: ["desktop", "monitor", "screen"] },
            { name: "Keyboard", emoji: "⌨️", keywords: ["keyboard", "type", "input"] },
            { name: "Mouse", emoji: "🖱️", keywords: ["mouse", "click", "pointer"] },
            { name: "Hard Drive", emoji: "💾", keywords: ["save", "disk", "storage"] },
            { name: "CD/DVD", emoji: "💿", keywords: ["cd", "dvd", "disc"] },
            { name: "USB", emoji: "🔌", keywords: ["usb", "plug", "connect"] },
            { name: "Battery", emoji: "🔋", keywords: ["battery", "power", "charge"] },
            { name: "Settings", emoji: "⚙️", keywords: ["settings", "config", "gear"] },
            { name: "Tools", emoji: "🔧", keywords: ["tools", "wrench", "fix"] },
            { name: "Bug", emoji: "🐛", keywords: ["bug", "debug", "error"] },
            { name: "Shield", emoji: "🛡️", keywords: ["security", "protect", "shield"] }
        ]
    },

    // Media & Entertainment
    media: {
        name: "Media & Entertainment",
        icons: [
            { name: "Play", emoji: "▶️", keywords: ["play", "start", "begin"] },
            { name: "Pause", emoji: "⏸️", keywords: ["pause", "stop", "break"] },
            { name: "Stop", emoji: "⏹️", keywords: ["stop", "end", "halt"] },
            { name: "Record", emoji: "⏺️", keywords: ["record", "capture", "rec"] },
            { name: "Fast Forward", emoji: "⏩", keywords: ["fast", "forward", "skip"] },
            { name: "Rewind", emoji: "⏪", keywords: ["rewind", "back", "previous"] },
            { name: "Volume Up", emoji: "🔊", keywords: ["volume", "loud", "sound"] },
            { name: "Volume Down", emoji: "🔉", keywords: ["volume", "quiet", "sound"] },
            { name: "Mute", emoji: "🔇", keywords: ["mute", "silent", "quiet"] },
            { name: "Music", emoji: "🎵", keywords: ["music", "song", "audio"] },
            { name: "Headphones", emoji: "🎧", keywords: ["headphones", "audio", "listen"] },
            { name: "Microphone", emoji: "🎤", keywords: ["microphone", "mic", "record"] },
            { name: "Camera", emoji: "📷", keywords: ["camera", "photo", "picture"] },
            { name: "Video", emoji: "📹", keywords: ["video", "camera", "record"] },
            { name: "TV", emoji: "📺", keywords: ["tv", "television", "screen"] },
            { name: "Radio", emoji: "📻", keywords: ["radio", "broadcast", "fm"] }
        ]
    },

    // Files & Folders
    files: {
        name: "Files & Folders",
        icons: [
            { name: "Folder", emoji: "📁", keywords: ["folder", "directory", "files"] },
            { name: "Open Folder", emoji: "📂", keywords: ["open", "folder", "browse"] },
            { name: "Document", emoji: "📄", keywords: ["document", "file", "text"] },
            { name: "Page", emoji: "📃", keywords: ["page", "document", "paper"] },
            { name: "Notebook", emoji: "📔", keywords: ["notebook", "notes", "book"] },
            { name: "Book", emoji: "📖", keywords: ["book", "read", "manual"] },
            { name: "Bookmark", emoji: "🔖", keywords: ["bookmark", "tag", "mark"] },
            { name: "Clipboard", emoji: "📋", keywords: ["clipboard", "copy", "paste"] },
            { name: "Archive", emoji: "🗃️", keywords: ["archive", "box", "storage"] },
            { name: "Trash", emoji: "🗑️", keywords: ["trash", "delete", "remove"] },
            { name: "Download", emoji: "⬇️", keywords: ["download", "down", "get"] },
            { name: "Upload", emoji: "⬆️", keywords: ["upload", "up", "send"] }
        ]
    },

    // Communication & Internet
    communication: {
        name: "Communication & Internet",
        icons: [
            { name: "Email", emoji: "📧", keywords: ["email", "mail", "message"] },
            { name: "Phone", emoji: "📞", keywords: ["phone", "call", "telephone"] },
            { name: "Mobile", emoji: "📱", keywords: ["mobile", "phone", "cell"] },
            { name: "Message", emoji: "💬", keywords: ["message", "chat", "talk"] },
            { name: "Globe", emoji: "🌐", keywords: ["internet", "web", "global"] },
            { name: "Link", emoji: "🔗", keywords: ["link", "url", "chain"] },
            { name: "Satellite", emoji: "📡", keywords: ["satellite", "signal", "wifi"] },
            { name: "WiFi", emoji: "📶", keywords: ["wifi", "signal", "bars"] },
            { name: "Bluetooth", emoji: "🔵", keywords: ["bluetooth", "wireless", "connect"] },
            { name: "Share", emoji: "📤", keywords: ["share", "send", "export"] },
            { name: "Receive", emoji: "📥", keywords: ["receive", "inbox", "import"] }
        ]
    },

    // Navigation & Actions
    navigation: {
        name: "Navigation & Actions",
        icons: [
            { name: "Home", emoji: "🏠", keywords: ["home", "house", "main"] },
            { name: "Back", emoji: "⬅️", keywords: ["back", "left", "previous"] },
            { name: "Forward", emoji: "➡️", keywords: ["forward", "right", "next"] },
            { name: "Up", emoji: "⬆️", keywords: ["up", "top", "above"] },
            { name: "Down", emoji: "⬇️", keywords: ["down", "bottom", "below"] },
            { name: "Refresh", emoji: "🔄", keywords: ["refresh", "reload", "update"] },
            { name: "Search", emoji: "🔍", keywords: ["search", "find", "look"] },
            { name: "Add", emoji: "➕", keywords: ["add", "plus", "new"] },
            { name: "Remove", emoji: "➖", keywords: ["remove", "minus", "delete"] },
            { name: "Close", emoji: "❌", keywords: ["close", "x", "cancel"] },
            { name: "Check", emoji: "✅", keywords: ["check", "done", "complete"] },
            { name: "Warning", emoji: "⚠️", keywords: ["warning", "alert", "caution"] },
            { name: "Info", emoji: "ℹ️", keywords: ["info", "information", "help"] },
            { name: "Question", emoji: "❓", keywords: ["question", "help", "unknown"] }
        ]
    },

    // Gaming & Entertainment
    gaming: {
        name: "Gaming & Entertainment",
        icons: [
            { name: "Game Controller", emoji: "🎮", keywords: ["game", "controller", "gaming"] },
            { name: "Joystick", emoji: "🕹️", keywords: ["joystick", "arcade", "control"] },
            { name: "Dice", emoji: "🎲", keywords: ["dice", "random", "game"] },
            { name: "Target", emoji: "🎯", keywords: ["target", "aim", "goal"] },
            { name: "Trophy", emoji: "🏆", keywords: ["trophy", "win", "achievement"] },
            { name: "Medal", emoji: "🏅", keywords: ["medal", "award", "prize"] },
            { name: "Star", emoji: "⭐", keywords: ["star", "favorite", "rating"] },
            { name: "Fire", emoji: "🔥", keywords: ["fire", "hot", "trending"] },
            { name: "Lightning", emoji: "⚡", keywords: ["lightning", "fast", "power"] },
            { name: "Rocket", emoji: "🚀", keywords: ["rocket", "launch", "speed"] }
        ]
    },

    // Applications & Software
    applications: {
        name: "Applications & Software",
        icons: [
            { name: "Calculator", emoji: "🧮", keywords: ["calculator", "math", "numbers"] },
            { name: "Calendar", emoji: "📅", keywords: ["calendar", "date", "schedule"] },
            { name: "Clock", emoji: "🕐", keywords: ["clock", "time", "hour"] },
            { name: "Timer", emoji: "⏰", keywords: ["timer", "alarm", "countdown"] },
            { name: "Stopwatch", emoji: "⏱️", keywords: ["stopwatch", "time", "measure"] },
            { name: "Chart", emoji: "📊", keywords: ["chart", "graph", "data"] },
            { name: "Graph", emoji: "📈", keywords: ["graph", "trend", "up"] },
            { name: "Map", emoji: "🗺️", keywords: ["map", "location", "navigation"] },
            { name: "Compass", emoji: "🧭", keywords: ["compass", "direction", "north"] },
            { name: "Magnifying Glass", emoji: "🔎", keywords: ["magnify", "zoom", "search"] }
        ]
    },

    // Symbols & Shapes
    symbols: {
        name: "Symbols & Shapes",
        icons: [
            { name: "Circle", emoji: "⭕", keywords: ["circle", "round", "ring"] },
            { name: "Square", emoji: "⬜", keywords: ["square", "box", "white"] },
            { name: "Diamond", emoji: "💎", keywords: ["diamond", "gem", "precious"] },
            { name: "Heart", emoji: "❤️", keywords: ["heart", "love", "like"] },
            { name: "Thumbs Up", emoji: "👍", keywords: ["thumbs", "up", "good"] },
            { name: "Thumbs Down", emoji: "👎", keywords: ["thumbs", "down", "bad"] },
            { name: "Peace", emoji: "✌️", keywords: ["peace", "victory", "two"] },
            { name: "OK Hand", emoji: "👌", keywords: ["ok", "good", "perfect"] },
            { name: "Pointing Right", emoji: "👉", keywords: ["point", "right", "finger"] },
            { name: "Pointing Left", emoji: "👈", keywords: ["point", "left", "finger"] },
            { name: "Clap", emoji: "👏", keywords: ["clap", "applause", "good"] },
            { name: "Fist", emoji: "✊", keywords: ["fist", "power", "strong"] }
        ]
    }
};

// Search function for icons
function searchIcons(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    Object.values(ICON_LIBRARY).forEach(category => {
        category.icons.forEach(icon => {
            const matches = 
                icon.name.toLowerCase().includes(searchTerm) ||
                icon.keywords.some(keyword => keyword.includes(searchTerm));
            
            if (matches) {
                results.push({
                    ...icon,
                    category: category.name
                });
            }
        });
    });
    
    return results;
}

// Get all icons as a flat array
function getAllIcons() {
    const allIcons = [];
    Object.values(ICON_LIBRARY).forEach(category => {
        category.icons.forEach(icon => {
            allIcons.push({
                ...icon,
                category: category.name
            });
        });
    });
    return allIcons;
}

// Get icons by category
function getIconsByCategory(categoryKey) {
    return ICON_LIBRARY[categoryKey] ? ICON_LIBRARY[categoryKey].icons : [];
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ICON_LIBRARY, searchIcons, getAllIcons, getIconsByCategory };
}