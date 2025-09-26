// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Add to home screen functionality for iOS
let deferredPrompt;
const addToHomeBtn = document.createElement('button');
addToHomeBtn.style.display = 'none';

// For iOS devices, show custom install prompt
if (navigator.standalone === false && 
    navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    
    // Check if we've already shown the prompt
    if (!localStorage.getItem('installPromptShown')) {
        // Wait a moment before showing the prompt
        setTimeout(() => {
            const installPrompt = document.createElement('div');
            installPrompt.className = 'ios-install-prompt';
            installPrompt.innerHTML = `
                <div class="prompt-content">
                    <p>Install iDeck on your home screen for the best experience:</p>
                    <ol>
                        <li>Tap the share icon <span class="icon">⎙</span></li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                    </ol>
                    <button id="dismiss-prompt">Got it</button>
                </div>
            `;
            document.body.appendChild(installPrompt);
            
            // Add event listener to the button we just created
            const dismissBtn = installPrompt.querySelector('#dismiss-prompt');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    installPrompt.remove();
                    localStorage.setItem('installPromptShown', 'true');
                });
            }
        }, 2000);
    }
}

// Add CSS for the iOS install prompt
const style = document.createElement('style');
style.textContent = `
    .ios-install-prompt {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 1000;
        width: 90%;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
    
    .prompt-content {
        text-align: center;
    }
    
    .prompt-content ol {
        text-align: left;
        margin: 15px 0;
        padding-left: 20px;
    }
    
    .prompt-content li {
        margin-bottom: 8px;
    }
    
    .icon {
        font-size: 1.2em;
    }
    
    #dismiss-prompt {
        background-color: #3498db;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 5px;
        margin-top: 10px;
    }
`;
document.head.appendChild(style);