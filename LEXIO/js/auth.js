/**
 * LEXIO - Authentication Module
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

function initAuth() {
    // DOM Elements
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameDisplay = document.getElementById('userName');
    const userInitials = document.getElementById('userInitials');
    const userAvatar = document.getElementById('userAvatar');

    // Current user
    let currentUser = null;

    // Safe showStatus function (doesn't depend on other files)
    function showSafeStatus(message, type = 'error') {
        // Try to use global showStatus if available
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, type);
        } else {
            // Fallback: create a temporary status div
            let statusDiv = document.getElementById('status');
            if (!statusDiv) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'status';
                statusDiv.className = 'status';
                const displayPanel = document.querySelector('.display-panel');
                if (displayPanel) {
                    displayPanel.appendChild(statusDiv);
                }
            }
            
            statusDiv.textContent = message;
            statusDiv.style.display = 'block';
            statusDiv.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
            statusDiv.style.color = type === 'error' ? '#EF4444' : '#10B981';
            statusDiv.style.border = type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)';
            
            setTimeout(() => {
                if (statusDiv) statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    // Simple email validation (doesn't depend on utils)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Simple phone validation (doesn't depend on utils)
    function validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    }

    // Get user initials (doesn't depend on utils)
    function getUserInitials(name) {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Safe add activity function
    function addSafeActivity(message) {
        if (typeof window.addActivity === 'function') {
            window.addActivity(message);
        } else {
            console.log('Activity:', message);
        }
    }

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            
            if (!nameInput || !emailInput || !phoneInput) {
                showSafeStatus('Form elements not found', 'error');
                return;
            }
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            
            // Validate
            if (!name || !email || !phone) {
                showSafeStatus('Please fill in all fields', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showSafeStatus('Please enter a valid email address', 'error');
                return;
            }
            
            if (!validatePhone(phone)) {
                showSafeStatus('Please enter a valid phone number', 'error');
                return;
            }
            
            // Store user
            currentUser = { name, email, phone };
            window.currentUser = currentUser;
            
            // Update UI
            if (userNameDisplay) userNameDisplay.textContent = name;
            if (userInitials) userInitials.textContent = getUserInitials(name);
            
            // Set avatar color based on name
            if (userAvatar) {
                const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
                userAvatar.style.background = `linear-gradient(135deg, hsl(${hue}, 80%, 60%), hsl(${hue + 50}, 80%, 50%))`;
            }
            
            // Switch to main app
            if (loginPage) loginPage.style.display = 'none';
            if (mainApp) mainApp.style.display = 'flex';
            
            // Add to activity log
            addSafeActivity(`User ${name} logged in`);
            
            // Show welcome
            showSafeStatus(`Welcome, ${name}!`, 'success');
        });
    }

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Stop any ongoing speech
            if (window.synth && window.synth.speaking) {
                window.synth.cancel();
            }
            
            // Reset user
            currentUser = null;
            window.currentUser = null;
            
            // Clear form
            const loginFormElement = document.getElementById('loginForm');
            if (loginFormElement) loginFormElement.reset();
            
            // Switch to login
            if (mainApp) mainApp.style.display = 'none';
            if (loginPage) loginPage.style.display = 'flex';
            
            // Add to activity
            addSafeActivity('User logged out');
        });
    }

    // Check if we're already on main app (for development)
    // This helps if you want to bypass login for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('dev')) {
        if (loginPage) loginPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = 'Developer';
        if (userInitials) userInitials.textContent = 'DV';
        addSafeActivity('Developer mode activated');
    }
}

// Export for use in other modules
console.log('✅ Auth module loaded');