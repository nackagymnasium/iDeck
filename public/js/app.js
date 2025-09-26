// DOM Content Loaded wrapper to ensure all elements are available
document.addEventListener('DOMContentLoaded', function() {

// Connect to the server
const socket = io();

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const deckGrid = document.getElementById('deck-grid');
const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');
const exitSettingsBtn = document.getElementById('exit-settings');
const applyGridBtn = document.getElementById('apply-grid');
const rowsInput = document.getElementById('rows');
const columnsInput = document.getElementById('columns');
const buttonEditor = document.getElementById('button-editor');
const commandTypeRadios = document.querySelectorAll('input[name="command-type"]');
const shellCommandGroup = document.getElementById('shell-command-group');
const keypressGroup = document.getElementById('keypress-group');
const saveButtonBtn = document.getElementById('save-button');
const cancelButtonBtn = document.getElementById('cancel-button');
const addButtonBtn = document.getElementById('add-button');
const removeButtonBtn = document.getElementById('remove-button');
const editLayoutBtn = document.getElementById('edit-layout');
const exitLayoutModeBtn = document.getElementById('exit-layout-mode');
const layoutModeInfo = document.getElementById('layout-mode-info');

// Page navigation elements
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const addPageBtn = document.getElementById('add-page');
const deletePageBtn = document.getElementById('delete-page');
const pageIndicator = document.getElementById('page-indicator');

// Profile management elements
const profileSelect = document.getElementById('profile-select');
const profileSelectSettings = document.getElementById('profile-select-settings');
const profileNameInput = document.getElementById('profile-name');
const createProfileBtn = document.getElementById('create-profile');
const duplicateProfileBtn = document.getElementById('duplicate-profile');
const deleteProfileBtn = document.getElementById('delete-profile');
const profileList = document.getElementById('profile-list');

// App state
let currentConfig = {
    rows: 3,
    columns: 4,
    buttons: {},
    layout: {
        hiddenButtons: []
    },
    pages: [
        {
            id: 1,
            name: 'Page 1',
            buttons: {}
        }
    ],
    currentPage: 1
};

// Profile management
let profiles = {
    'default': {
        name: 'Default Profile',
        config: JSON.parse(JSON.stringify(currentConfig)) // Deep copy
    }
};
let currentProfile = 'default';

let editingButtonId = null;
let isLayoutMode = false;

// Load configuration from localStorage
function loadConfig() {
    const savedConfig = localStorage.getItem('iDeckConfig');
    const savedProfiles = localStorage.getItem('ideckProfiles');
    const savedCurrentProfile = localStorage.getItem('ideckCurrentProfile');
    
    if (savedConfig) {
        try {
            currentConfig = JSON.parse(savedConfig);
            rowsInput.value = currentConfig.rows;
            columnsInput.value = currentConfig.columns;
        } catch (e) {
            console.error('Failed to load saved configuration:', e);
        }
    }
    
    if (savedProfiles) {
        profiles = JSON.parse(savedProfiles);
    }
    
    if (savedCurrentProfile && profiles[savedCurrentProfile]) {
        currentProfile = savedCurrentProfile;
        currentConfig = JSON.parse(JSON.stringify(profiles[currentProfile].config));
    }
    
    updateProfileSelector();
}

// Save configuration to localStorage
function saveConfig() {
    localStorage.setItem('iDeckConfig', JSON.stringify(currentConfig));
    
    // Update current profile with current config
    profiles[currentProfile].config = JSON.parse(JSON.stringify(currentConfig));
    localStorage.setItem('ideckProfiles', JSON.stringify(profiles));
    localStorage.setItem('ideckCurrentProfile', currentProfile);
}

// Generate the button grid
function generateGrid() {
    deckGrid.innerHTML = '';
    deckGrid.style.gridTemplateColumns = `repeat(${currentConfig.columns}, 1fr)`;
    deckGrid.style.gridTemplateRows = `repeat(${currentConfig.rows}, 1fr)`;
    
    const currentPageButtons = getCurrentPageButtons();
    
    for (let row = 0; row < currentConfig.rows; row++) {
        for (let col = 0; col < currentConfig.columns; col++) {
            const buttonId = `button-${row}-${col}`;
            const position = `${row}-${col}`;
            
            // Check if this position should have a button
            const hasButton = !currentConfig.layout.hiddenButtons || 
                             !currentConfig.layout.hiddenButtons.includes(position);
            
            if (!hasButton) {
                // Create an empty placeholder
                const emptySpace = document.createElement('div');
                emptySpace.className = 'deck-button empty';
                emptySpace.id = buttonId;
                emptySpace.dataset.position = position;
                
                // In layout mode, allow adding buttons to empty spaces
                if (isLayoutMode) {
                    emptySpace.addEventListener('click', () => toggleButtonVisibility(position));
                }
                
                deckGrid.appendChild(emptySpace);
                continue;
            }
            
            const buttonConfig = currentPageButtons[buttonId] || {
                name: '',
                color: '#3498db',
                commandType: 'shell',
                command: ''
            };
            
            const button = document.createElement('div');
            button.className = 'deck-button';
            button.id = buttonId;
            button.style.backgroundColor = buttonConfig.color;
            button.dataset.position = position;
            
            // Create button content with icon support
            let buttonHTML = '';
            const iconHTML = buttonConfig.icon ? `<span class="button-icon">${buttonConfig.icon}</span>` : '';
            const nameHTML = buttonConfig.name ? `<span class="button-text">${buttonConfig.name}</span>` : '';
            
            // Add special styling for different button types
            if (buttonConfig.commandType === 'folder') {
                button.classList.add('folder-button');
                const folderIcon = buttonConfig.icon || '📁';
                buttonHTML = `<span class="folder-icon">${folderIcon}</span>${nameHTML}`;
            } else if (buttonConfig.commandType === 'system') {
                button.classList.add('system-button');
                buttonHTML = `${iconHTML}<span class="system-value" id="system-${buttonId}">--</span>${nameHTML}`;
            } else if (buttonConfig.commandType === 'timer') {
                button.classList.add('timer-button');
                buttonHTML = `${iconHTML}<span class="timer-display" id="timer-${buttonId}">00:00</span>${nameHTML}`;
            } else {
                // Regular button (shell, keypress, app, etc.)
                if (buttonConfig.icon && buttonConfig.name) {
                    buttonHTML = `${iconHTML}${nameHTML}`;
                } else if (buttonConfig.icon) {
                    buttonHTML = iconHTML;
                } else {
                    buttonHTML = nameHTML;
                }
            }
            
            button.innerHTML = buttonHTML || '';
            
            // Fallback for buttons without HTML content
            if (!buttonHTML && !buttonConfig.icon) {
                button.textContent = buttonConfig.name || '';
            }
            
            // Add event listeners based on mode
            if (isLayoutMode) {
                button.addEventListener('click', () => toggleButtonVisibility(position));
            } else {
                // Regular click handler
                button.addEventListener('click', (e) => {
                    // If shift key is pressed, open editor instead of executing command
                    if (e.shiftKey) {
                        openButtonEditor(buttonId);
                    } else {
                        handleButtonClick(buttonId);
                    }
                });
                
                // Desktop context menu (right-click)
                button.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    openButtonEditor(buttonId);
                });
                
                // Mobile touch hold detection
                let touchTimer = null;
                let touchStarted = false;
                
                button.addEventListener('touchstart', (e) => {
                    touchStarted = true;
                    touchTimer = setTimeout(() => {
                        if (touchStarted) {
                            // Vibrate if available (mobile feedback)
                            if (navigator.vibrate) {
                                navigator.vibrate(50);
                            }
                            openButtonEditor(buttonId);
                            touchStarted = false;
                        }
                    }, 500); // 500ms hold time
                }, { passive: true });
                
                button.addEventListener('touchend', (e) => {
                    if (touchTimer) {
                        clearTimeout(touchTimer);
                    }
                    touchStarted = false;
                }, { passive: true });
                
                button.addEventListener('touchmove', (e) => {
                    if (touchTimer) {
                        clearTimeout(touchTimer);
                    }
                    touchStarted = false;
                }, { passive: true });
            }
            
            deckGrid.appendChild(button);
        }
    }
    
    updatePageIndicator();
}

// Handle button click (execute command)
function handleButtonClick(buttonId) {
    const currentPageButtons = getCurrentPageButtons();
    const buttonConfig = currentPageButtons[buttonId];
    if (!buttonConfig || !buttonConfig.command) {
        openButtonEditor(buttonId);
        return;
    }
    
    // Handle different command types
    if (buttonConfig.commandType === 'folder') {
        const targetPage = parseInt(buttonConfig.command);
        if (targetPage && currentConfig.pages.find(p => p.id === targetPage)) {
            switchToPage(targetPage);
        }
        return;
    }
    
    if (buttonConfig.commandType === 'timer') {
        handleTimerClick(buttonId, buttonConfig);
        return;
    }
    
    // Execute the command via socket
    socket.emit('executeCommand', {
        type: buttonConfig.commandType,
        command: buttonConfig.commandType === 'shell' ? buttonConfig.command : null,
        keys: buttonConfig.commandType === 'keypress' ? buttonConfig.command : null,
        action: buttonConfig.commandType === 'media' ? buttonConfig.command : null,
        appPath: buttonConfig.commandType === 'app' ? buttonConfig.command : null,
        appArgs: buttonConfig.commandType === 'app' ? buttonConfig.args : null,
        metric: buttonConfig.commandType === 'system' ? buttonConfig.command : null
    });
}

// Icon picker functionality
let selectedIcon = null;

function initializeIconPicker() {
    const chooseIconBtn = document.getElementById('choose-icon-btn');
    const removeIconBtn = document.getElementById('remove-icon-btn');
    const iconPickerModal = document.getElementById('icon-picker-modal');
    const closeIconPicker = document.getElementById('close-icon-picker');
    const iconSearchInput = document.getElementById('icon-search-input');
    const iconGrid = document.getElementById('icon-grid');
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    if (!chooseIconBtn || !iconPickerModal) return;
    
    // Open icon picker
    chooseIconBtn.addEventListener('click', () => {
        iconPickerModal.style.display = 'flex';
        populateIconGrid('all');
        if (iconSearchInput) {
            iconSearchInput.value = '';
            iconSearchInput.focus();
        }
    });
    
    // Close icon picker
    if (closeIconPicker) {
        closeIconPicker.addEventListener('click', () => {
            iconPickerModal.style.display = 'none';
        });
    }
    
    // Close on backdrop click
    iconPickerModal.addEventListener('click', (e) => {
        if (e.target === iconPickerModal) {
            iconPickerModal.style.display = 'none';
        }
    });
    
    // Remove icon
    if (removeIconBtn) {
        removeIconBtn.addEventListener('click', () => {
            selectedIcon = null;
            updateIconDisplay();
        });
    }
    
    // Category filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            populateIconGrid(category);
        });
    });
    
    // Search functionality
    if (iconSearchInput) {
        iconSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query) {
                const results = searchIcons(query);
                displayIcons(results);
            } else {
                const activeCategory = document.querySelector('.category-btn.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                populateIconGrid(category);
            }
        });
    }
}

function populateIconGrid(category) {
    let icons;
    if (category === 'all') {
        icons = getAllIcons();
    } else {
        icons = getIconsByCategory(category);
        // Add category name to each icon for consistency
        icons = icons.map(icon => ({ ...icon, category: ICON_LIBRARY[category].name }));
    }
    displayIcons(icons);
}

function displayIcons(icons) {
    const iconGrid = document.getElementById('icon-grid');
    if (!iconGrid) return;
    
    iconGrid.innerHTML = '';
    
    icons.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-option';
        iconElement.innerHTML = `
            <span class="icon-emoji">${icon.emoji}</span>
            <span class="icon-label">${icon.name}</span>
        `;
        
        iconElement.addEventListener('click', () => {
            selectedIcon = icon;
            updateIconDisplay();
            const modal = document.getElementById('icon-picker-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
        
        iconGrid.appendChild(iconElement);
    });
}

function updateIconDisplay() {
    const iconDisplay = document.getElementById('icon-display');
    const iconName = document.getElementById('icon-name');
    const removeIconBtn = document.getElementById('remove-icon-btn');
    
    // Check if elements exist before accessing them
    if (!iconDisplay || !iconName || !removeIconBtn) {
        return;
    }
    
    if (selectedIcon) {
        iconDisplay.textContent = selectedIcon.emoji;
        iconName.textContent = selectedIcon.name;
        removeIconBtn.style.display = 'inline-block';
    } else {
        iconDisplay.textContent = '🎯';
        iconName.textContent = 'No Icon';
        removeIconBtn.style.display = 'none';
    }
}

// Open button editor
function openButtonEditor(buttonId) {
    editingButtonId = buttonId;
    const currentPageButtons = getCurrentPageButtons();
    const buttonConfig = currentPageButtons[buttonId] || {
        name: '',
        color: '#3498db',
        commandType: 'shell',
        command: '',
        icon: null
    };
    
    document.getElementById('button-name').value = buttonConfig.name;
    document.getElementById('button-color').value = buttonConfig.color;
    
    // Set icon
    selectedIcon = buttonConfig.icon || null;
    updateIconDisplay();
    
    // Set command type
    const commandTypeRadio = document.querySelector(`input[name="command-type"][value="${buttonConfig.commandType}"]`);
    if (commandTypeRadio) {
        commandTypeRadio.checked = true;
    }
    
    document.getElementById('shell-command').value = buttonConfig.commandType === 'shell' ? buttonConfig.command : '';
    document.getElementById('key-combination').value = buttonConfig.commandType === 'keypress' ? buttonConfig.command : '';
    
    // Set values for new command types
    if (buttonConfig.commandType === 'media') {
        document.getElementById('media-action').value = buttonConfig.command || 'play';
    } else if (buttonConfig.commandType === 'folder') {
        updateFolderTargetOptions();
        document.getElementById('folder-target').value = buttonConfig.command || '1';
    } else if (buttonConfig.commandType === 'app') {
        document.getElementById('app-path').value = buttonConfig.command || '';
        document.getElementById('app-args').value = buttonConfig.args || '';
    } else if (buttonConfig.commandType === 'system') {
        document.getElementById('system-metric').value = buttonConfig.command || 'cpu';
    } else if (buttonConfig.commandType === 'timer') {
        document.getElementById('timer-type').value = buttonConfig.timerType || 'stopwatch';
        if (buttonConfig.timerType === 'countdown') {
            document.getElementById('countdown-minutes').value = buttonConfig.minutes || 5;
            document.getElementById('countdown-seconds').value = buttonConfig.seconds || 0;
        }
        toggleCountdownSettings();
    }
    
    toggleCommandInputs(buttonConfig.commandType);
    
    buttonEditor.style.display = 'block';
}

// Toggle command input fields based on command type
function toggleCommandInputs(commandType) {
    shellCommandGroup.style.display = 'none';
    keypressGroup.style.display = 'none';
    document.getElementById('media-control-group').style.display = 'none';
    document.getElementById('folder-group').style.display = 'none';
    document.getElementById('app-group').style.display = 'none';
    document.getElementById('system-group').style.display = 'none';
    document.getElementById('timer-group').style.display = 'none';
    
    if (commandType === 'shell') {
        shellCommandGroup.style.display = 'block';
    } else if (commandType === 'keypress') {
        keypressGroup.style.display = 'block';
    } else if (commandType === 'media') {
        document.getElementById('media-control-group').style.display = 'block';
    } else if (commandType === 'folder') {
        document.getElementById('folder-group').style.display = 'block';
        updateFolderTargetOptions();
    } else if (commandType === 'app') {
        document.getElementById('app-group').style.display = 'block';
    } else if (commandType === 'system') {
        document.getElementById('system-group').style.display = 'block';
    } else if (commandType === 'timer') {
        document.getElementById('timer-group').style.display = 'block';
        toggleCountdownSettings();
    }
}

// Save button configuration
function saveButtonConfig() {
    const name = document.getElementById('button-name').value;
    const color = document.getElementById('button-color').value;
    const commandType = document.querySelector('input[name="command-type"]:checked')?.value || 'shell';
    let command, args, timerType, minutes, seconds;
    
    if (commandType === 'shell') {
        command = document.getElementById('shell-command').value;
    } else if (commandType === 'keypress') {
        command = document.getElementById('key-combination').value;
    } else if (commandType === 'media') {
        command = document.getElementById('media-action').value;
    } else if (commandType === 'folder') {
        command = document.getElementById('folder-target').value;
    } else if (commandType === 'app') {
        command = document.getElementById('app-path').value;
        args = document.getElementById('app-args').value;
    } else if (commandType === 'system') {
        command = document.getElementById('system-metric').value;
    } else if (commandType === 'timer') {
        timerType = document.getElementById('timer-type').value;
        if (timerType === 'countdown') {
            minutes = parseInt(document.getElementById('countdown-minutes').value) || 5;
            seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
        }
        command = timerType;
    }
    
    const buttonConfig = {
        name,
        color,
        commandType,
        command,
        icon: selectedIcon
    };
    
    // Add additional properties for specific command types
    if (commandType === 'app' && args) {
        buttonConfig.args = args;
    } else if (commandType === 'timer') {
        buttonConfig.timerType = timerType;
        if (timerType === 'countdown') {
            buttonConfig.minutes = minutes;
            buttonConfig.seconds = seconds;
        }
    }
    
    setCurrentPageButton(editingButtonId, buttonConfig);
    
    saveConfig();
    generateGrid();
    buttonEditor.style.display = 'none';
}

// Toggle button visibility in layout mode
function toggleButtonVisibility(position) {
    if (!isLayoutMode) return;
    
    if (!currentConfig.layout.hiddenButtons) {
        currentConfig.layout.hiddenButtons = [];
    }
    
    const index = currentConfig.layout.hiddenButtons.indexOf(position);
    if (index === -1) {
        // Hide the button
        currentConfig.layout.hiddenButtons.push(position);
    } else {
        // Show the button
        currentConfig.layout.hiddenButtons.splice(index, 1);
    }
    
    saveConfig();
    generateGrid();
}

// Enter layout edit mode
function enterLayoutMode() {
    isLayoutMode = true;
    layoutModeInfo.style.display = 'block';
    // Close settings panel when entering layout mode to avoid conflicts
    if (settingsPanel) {
        settingsPanel.classList.remove('active');
    }
    generateGrid(); // Regenerate grid with layout mode event listeners
}

// Exit layout edit mode
function exitLayoutMode() {
    isLayoutMode = false;
    layoutModeInfo.style.display = 'none';
    generateGrid(); // Regenerate grid with normal event listeners
}

// Event listeners
if (settingsToggle) {
    settingsToggle.addEventListener('click', () => {
        if (settingsPanel) {
            settingsPanel.classList.toggle('active');
        }
        if (buttonEditor) {
            buttonEditor.style.display = 'none';
        }
    });
} else {
    console.error('Settings toggle button not found in DOM');
}

if (exitSettingsBtn) {
    exitSettingsBtn.addEventListener('click', () => {
        if (settingsPanel) {
            settingsPanel.classList.remove('active');
        }
    });
} else {
    console.error('Exit settings button not found in DOM');
}

// Add null checks for event listeners
if (applyGridBtn) {
    applyGridBtn.addEventListener('click', () => {
        if (rowsInput && columnsInput) {
            currentConfig.rows = parseInt(rowsInput.value) || 3;
            currentConfig.columns = parseInt(columnsInput.value) || 4;
            saveConfig();
            generateGrid();
        }
    });
}

// Add event listeners for command type radio buttons
if (commandTypeRadios && commandTypeRadios.length > 0) {
    commandTypeRadios.forEach(radio => {
        if (radio) {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    toggleCommandInputs(radio.value);
                }
            });
        }
    });
}

if (saveButtonBtn) {
    saveButtonBtn.addEventListener('click', saveButtonConfig);
}

if (cancelButtonBtn) {
    cancelButtonBtn.addEventListener('click', () => {
        if (buttonEditor) {
            buttonEditor.style.display = 'none';
        }
    });
}

// Layout customization event listeners
if (addButtonBtn) {
    addButtonBtn.addEventListener('click', () => {
        // Add a new button at the first available empty position
        if (!currentConfig.layout.hiddenButtons) {
            currentConfig.layout.hiddenButtons = [];
        }
        
        if (currentConfig.layout.hiddenButtons.length > 0) {
            const position = currentConfig.layout.hiddenButtons.pop();
            saveConfig();
            generateGrid();
        }
    });
}

if (removeButtonBtn) {
    removeButtonBtn.addEventListener('click', () => {
        enterLayoutMode();
    });
}

if (editLayoutBtn) {
    editLayoutBtn.addEventListener('click', () => {
        enterLayoutMode();
    });
}

if (exitLayoutModeBtn) {
    exitLayoutModeBtn.addEventListener('click', () => {
        exitLayoutMode();
    });
}

// Socket event handlers
socket.on('connect', () => {
    if (statusIndicator) {
        statusIndicator.classList.add('connected');
    }
    if (statusText) {
        statusText.textContent = 'Connected';
    }
});

socket.on('disconnect', () => {
    if (statusIndicator) {
        statusIndicator.classList.remove('connected');
    }
    if (statusText) {
        statusText.textContent = 'Disconnected';
    }
});

socket.on('commandResult', (result) => {
    if (!result.success) {
        console.error('Command failed:', result.error);
    }
});

// Listen for system data updates
socket.on('systemData', (data) => {
    const systemDisplay = document.getElementById(`system-${data.buttonId || 'unknown'}`);
    if (systemDisplay) {
        systemDisplay.textContent = data.value;
    }
    
    // Update all system buttons with the same metric
    const systemButtons = document.querySelectorAll('.system-button');
    systemButtons.forEach(button => {
        const buttonId = button.id;
        const buttonConfig = getCurrentPageButtons()[buttonId];
        if (buttonConfig && buttonConfig.commandType === 'system' && buttonConfig.metric === data.metric) {
            const systemValue = document.getElementById(`system-${buttonId}`);
            if (systemValue) {
                systemValue.textContent = data.value;
            }
        }
    });
});

// Initialize the app
loadConfig();
generateGrid();
updatePageIndicator();
updateDeletePageButton();

// Prevent default touch behavior to avoid zooming and scrolling
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent context menu on mobile (but allow it on buttons for editing)
document.addEventListener('contextmenu', (e) => {
    // Only prevent context menu if it's not on a deck button
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && !e.target.classList.contains('deck-button')) {
        e.preventDefault();
    }
});

// Profile management functions
function updateProfileSelector() {
    // Update main profile selector
    profileSelect.innerHTML = '';
    Object.keys(profiles).forEach(profileId => {
        const option = document.createElement('option');
        option.value = profileId;
        option.textContent = profiles[profileId].name;
        option.selected = profileId === currentProfile;
        profileSelect.appendChild(option);
    });

    // Update settings profile selector if it exists
    if (profileSelectSettings) {
        profileSelectSettings.innerHTML = '';
        Object.keys(profiles).forEach(profileId => {
            const option = document.createElement('option');
            option.value = profileId;
            option.textContent = profiles[profileId].name;
            option.selected = profileId === currentProfile;
            profileSelectSettings.appendChild(option);
        });
    }
}

function switchProfile(profileId) {
    if (!profiles[profileId]) return;
    
    // Save current profile
    profiles[currentProfile].config = JSON.parse(JSON.stringify(currentConfig));
    
    // Switch to new profile
    currentProfile = profileId;
    currentConfig = JSON.parse(JSON.stringify(profiles[profileId].config));
    
    saveConfig();
    generateGrid();
    updatePageIndicator();
    updateProfileSelector();
}

function createProfile(name) {
    if (!name || name.trim() === '') return;
    
    const profileId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (profiles[profileId]) {
        alert('Profile already exists!');
        return;
    }
    
    profiles[profileId] = {
        name: name,
        config: JSON.parse(JSON.stringify(currentConfig))
    };
    
    saveConfig();
    updateProfileSelector();
    updateProfileList();
}

function duplicateProfile(name) {
    if (!name || name.trim() === '') return;
    
    const profileId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (profiles[profileId]) {
        alert('Profile already exists!');
        return;
    }
    
    profiles[profileId] = {
        name: name,
        config: JSON.parse(JSON.stringify(currentConfig))
    };
    
    saveConfig();
    updateProfileSelector();
    updateProfileList();
}

function deleteProfile(profileId) {
    if (profileId === 'default') {
        alert('Cannot delete default profile!');
        return;
    }
    
    if (Object.keys(profiles).length <= 1) {
        alert('Cannot delete the last profile!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${profiles[profileId].name}"?`)) {
        delete profiles[profileId];
        
        if (currentProfile === profileId) {
            switchProfile('default');
        }
        
        saveConfig();
        updateProfileSelector();
        updateProfileList();
    }
}

function updateProfileList() {
    profileList.innerHTML = '';
    Object.keys(profiles).forEach(profileId => {
        const profileItem = document.createElement('div');
        profileItem.className = `profile-item ${profileId === currentProfile ? 'active' : ''}`;
        
        const profileName = document.createElement('span');
        profileName.textContent = profiles[profileId].name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteProfile(profileId);
        deleteBtn.disabled = profileId === 'default';
        
        profileItem.appendChild(profileName);
        if (profileId !== 'default') {
            profileItem.appendChild(deleteBtn);
        }
        
        profileList.appendChild(profileItem);
    });
}

// Page navigation functions
function updatePageIndicator() {
    const currentIndex = currentConfig.pages.findIndex(p => p.id === currentConfig.currentPage);
    const currentPage = currentConfig.pages[currentIndex];
    const pageName = currentPage ? currentPage.name : `Page ${currentConfig.currentPage}`;
    pageIndicator.textContent = `${pageName} (${currentIndex + 1} of ${currentConfig.pages.length})`;
    
    // Update button states based on current position in the array
    prevPageBtn.disabled = currentIndex === 0;
    nextPageBtn.disabled = currentIndex === currentConfig.pages.length - 1;
    updateDeletePageButton();
}

function switchToPage(pageId) {
    // Validate that the page exists
    const pageExists = currentConfig.pages.find(p => p.id === pageId);
    if (!pageExists) {
        console.error('Page does not exist:', pageId);
        return;
    }
    
    currentConfig.currentPage = pageId;
    saveConfig();
    generateGrid();
    updatePageIndicator();
}

// Make debugStorage available globally for console access (for development only)
// window.debugStorage = debugStorage;

function addNewPage() {
    // Find the next available sequential ID starting from 1
    let newPageId = 1;
    const existingIds = currentConfig.pages.map(p => p.id).sort((a, b) => a - b);
    
    // Find the first gap in the sequence or use the next number after the highest
    for (let i = 0; i < existingIds.length; i++) {
        if (existingIds[i] !== newPageId) {
            // Found a gap, use this ID
            break;
        }
        newPageId++;
    }
    
    const newPageName = `Page ${newPageId}`;
    
    currentConfig.pages.push({
        id: newPageId,
        name: newPageName,
        buttons: {}
    });
    
    // Sort pages by ID to maintain order
    currentConfig.pages.sort((a, b) => a.id - b.id);
    
    switchToPage(newPageId);
}

function deletePage() {
    // Safety check: Don't allow deleting if only one page exists
    if (currentConfig.pages.length <= 1) {
        alert('Cannot delete the last page!');
        return;
    }
    
    const currentPageName = currentConfig.pages.find(p => p.id === currentConfig.currentPage)?.name || 'this page';
    
    const confirmMessage = `Are you sure you want to delete "${currentPageName}"? This action cannot be undone.`;
    
    // Confirm deletion
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Remove the current page
    currentConfig.pages = currentConfig.pages.filter(p => p.id !== currentConfig.currentPage);
    
    // Switch to the first available page
    const firstPage = currentConfig.pages[0];
    if (firstPage) {
        currentConfig.currentPage = firstPage.id;
    }
    
    // Update UI and save
    saveConfig();
    generateGrid();
    updatePageIndicator();
    updateDeletePageButton();
}

function updateDeletePageButton() {
    // Disable delete button if only one page exists
    deletePageBtn.disabled = currentConfig.pages.length <= 1;
}

function getCurrentPageButtons() {
    const currentPage = currentConfig.pages.find(p => p.id === currentConfig.currentPage);
    return currentPage ? currentPage.buttons : {};
}

function setCurrentPageButton(buttonId, buttonConfig) {
    const currentPage = currentConfig.pages.find(p => p.id === currentConfig.currentPage);
    if (currentPage) {
        if (!currentPage.buttons) currentPage.buttons = {};
        currentPage.buttons[buttonId] = buttonConfig;
    }
}

// Helper functions for new features
function updateFolderTargetOptions() {
    const folderTarget = document.getElementById('folder-target');
    folderTarget.innerHTML = '';
    currentConfig.pages.forEach(page => {
        if (page.id !== currentConfig.currentPage) {
            const option = document.createElement('option');
            option.value = page.id;
            option.textContent = page.name;
            folderTarget.appendChild(option);
        }
    });
}

function toggleCountdownSettings() {
    const timerType = document.getElementById('timer-type').value;
    const countdownSettings = document.getElementById('countdown-settings');
    countdownSettings.style.display = timerType === 'countdown' ? 'block' : 'none';
}

let timers = {};

function handleTimerClick(buttonId, buttonConfig) {
    if (timers[buttonId]) {
        // Stop existing timer
        clearInterval(timers[buttonId].interval);
        delete timers[buttonId];
        updateTimerDisplay(buttonId, '00:00');
        return;
    }
    
    if (buttonConfig.timerType === 'stopwatch') {
        startStopwatch(buttonId);
    } else if (buttonConfig.timerType === 'countdown') {
        startCountdown(buttonId, buttonConfig.minutes || 5, buttonConfig.seconds || 0);
    }
}

function startStopwatch(buttonId) {
    let seconds = 0;
    timers[buttonId] = {
        startTime: Date.now(),
        interval: setInterval(() => {
            seconds = Math.floor((Date.now() - timers[buttonId].startTime) / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            updateTimerDisplay(buttonId, `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`);
        }, 1000)
    };
}

function startCountdown(buttonId, minutes, seconds) {
    let totalSeconds = minutes * 60 + seconds;
    timers[buttonId] = {
        interval: setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(timers[buttonId].interval);
                delete timers[buttonId];
                updateTimerDisplay(buttonId, '00:00');
                // Could add notification here
                return;
            }
            totalSeconds--;
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            updateTimerDisplay(buttonId, `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }, 1000)
    };
}

function updateTimerDisplay(buttonId, timeString) {
    const timerDisplay = document.getElementById(`timer-${buttonId}`);
    if (timerDisplay) {
        timerDisplay.textContent = timeString;
    }
}

// Page navigation event listeners
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        const currentIndex = currentConfig.pages.findIndex(p => p.id === currentConfig.currentPage);
        if (currentIndex > 0) {
            const prevPage = currentConfig.pages[currentIndex - 1];
            switchToPage(prevPage.id);
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        const currentIndex = currentConfig.pages.findIndex(p => p.id === currentConfig.currentPage);
        if (currentIndex < currentConfig.pages.length - 1) {
            const nextPage = currentConfig.pages[currentIndex + 1];
            switchToPage(nextPage.id);
        }
    });
}

if (addPageBtn) {
    addPageBtn.addEventListener('click', addNewPage);
}

if (deletePageBtn) {
    deletePageBtn.addEventListener('click', deletePage);
}

// Timer type change listener
const timerTypeSelect = document.getElementById('timer-type');
if (timerTypeSelect) {
    timerTypeSelect.addEventListener('change', toggleCountdownSettings);
}

// Profile management event listeners
if (profileSelect) {
    profileSelect.addEventListener('change', (e) => {
        switchProfile(e.target.value);
    });
}

// Add event listener for settings profile selector
if (profileSelectSettings) {
    profileSelectSettings.addEventListener('change', (e) => {
        switchProfile(e.target.value);
    });
}

// Profile management is now integrated into settings panel - no separate event listeners needed

if (createProfileBtn) {
    createProfileBtn.addEventListener('click', () => {
        const name = profileNameInput.value.trim();
        if (name) {
            createProfile(name);
            profileNameInput.value = '';
        }
    });
}

if (duplicateProfileBtn) {
    duplicateProfileBtn.addEventListener('click', () => {
        const name = profileNameInput.value.trim();
        if (name) {
            duplicateProfile(name);
            profileNameInput.value = '';
        }
    });
}

if (deleteProfileBtn) {
    deleteProfileBtn.addEventListener('click', () => {
        if (currentProfile !== 'default') {
            deleteProfile(currentProfile);
        }
    });
}

// Initialize icon picker functionality
initializeIconPicker();

}); // End of DOMContentLoaded event listener