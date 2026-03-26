/**
 * LEXIO - Authentication Module
 */

document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

function initAuth() {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameDisplay = document.getElementById('userName');
    const userInitials = document.getElementById('userInitials');
    const userAvatar = document.getElementById('userAvatar');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPickerBtn = document.getElementById('avatarPickerBtn');
    const loginAvatarPreview = document.getElementById('loginAvatarPreview');

    let currentUser = null;
    let avatarDataUrl = '';

    function showSafeStatus(message, type) {
        const tone = type || 'error';
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, tone);
            return;
        }

        let statusDiv = document.getElementById('status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'status';
            statusDiv.className = 'status';
            const displayPanel = document.querySelector('.display-panel') || document.body;
            displayPanel.appendChild(statusDiv);
        }

        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        statusDiv.style.background = tone === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.12)';
        statusDiv.style.color = tone === 'error' ? '#dc2626' : '#2563eb';
        statusDiv.style.border = tone === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(37, 99, 235, 0.2)';

        setTimeout(function() {
            if (statusDiv) {
                statusDiv.style.display = 'none';
            }
        }, 3000);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    }

    function getUserInitials(name) {
        if (!name) {
            return 'U';
        }
        return name
            .split(/\s+/)
            .filter(Boolean)
            .map(function(part) { return part.charAt(0); })
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'U';
    }

    function addSafeActivity(message) {
        if (typeof window.addActivity === 'function') {
            window.addActivity(message);
        } else {
            console.log('Activity:', message);
        }
    }

    function paintAvatar(element, initialsElement, name, imageData, fallbackInitials) {
        if (!element) {
            return;
        }

        const initials = fallbackInitials || getUserInitials(name);
        const hue = (name || initials).split('').reduce(function(total, char) {
            return total + char.charCodeAt(0);
        }, 0) % 360;

        element.style.backgroundImage = '';
        element.style.backgroundSize = '';
        element.style.backgroundPosition = '';
        element.style.color = '#ffffff';
        element.classList.remove('has-photo');

        if (imageData) {
            element.style.background = '#dbeafe';
            element.style.backgroundImage = 'url(' + imageData + ')';
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.classList.add('has-photo');
            if (initialsElement) {
                initialsElement.textContent = initials;
                initialsElement.style.opacity = '0';
            } else {
                element.textContent = '';
            }
            return;
        }

        element.style.background = 'linear-gradient(135deg, hsl(' + hue + ', 82%, 55%), hsl(' + ((hue + 38) % 360) + ', 88%, 62%))';
        if (initialsElement) {
            initialsElement.textContent = initials;
            initialsElement.style.opacity = '1';
        } else {
            element.textContent = initials;
        }
    }

    function syncLoginAvatarPreview() {
        if (!loginAvatarPreview) {
            return;
        }
        const previewName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Liam Brooks';
        paintAvatar(loginAvatarPreview, null, previewName, avatarDataUrl, getUserInitials(previewName));
    }

    if (avatarPickerBtn && avatarInput) {
        avatarPickerBtn.addEventListener('click', function() {
            avatarInput.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', function(event) {
            const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
            if (!file) {
                avatarDataUrl = '';
                syncLoginAvatarPreview();
                return;
            }

            if (!file.type || file.type.indexOf('image/') !== 0) {
                showSafeStatus('Please upload a valid image for the display photo', 'error');
                avatarInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(loadEvent) {
                avatarDataUrl = typeof loadEvent.target.result === 'string' ? loadEvent.target.result : '';
                syncLoginAvatarPreview();
                showSafeStatus('Display photo added', 'success');
            };
            reader.readAsDataURL(file);
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', function() {
            if (!avatarDataUrl) {
                syncLoginAvatarPreview();
            }
        });
    }

    syncLoginAvatarPreview();

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!nameInput || !emailInput || !phoneInput) {
                showSafeStatus('Form elements not found', 'error');
                return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();

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

            currentUser = {
                name: name,
                email: email,
                phone: phone,
                avatar: avatarDataUrl
            };
            window.currentUser = currentUser;

            if (userNameDisplay) {
                userNameDisplay.textContent = name;
            }
            if (userInitials) {
                userInitials.textContent = getUserInitials(name);
            }
            paintAvatar(userAvatar, userInitials, name, avatarDataUrl, getUserInitials(name));

            if (loginPage) {
                loginPage.style.display = 'none';
            }
            if (mainApp) {
                mainApp.style.display = 'flex';
            }

            addSafeActivity('User ' + name + ' logged in');
            showSafeStatus('Welcome, ' + name + '!', 'success');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (window.synth && window.synth.speaking) {
                window.synth.cancel();
            }

            currentUser = null;
            window.currentUser = null;
            avatarDataUrl = '';

            if (loginForm) {
                loginForm.reset();
            }

            syncLoginAvatarPreview();
            paintAvatar(userAvatar, userInitials, 'User', '', 'U');

            if (mainApp) {
                mainApp.style.display = 'none';
            }
            if (loginPage) {
                loginPage.style.display = 'flex';
            }

            addSafeActivity('User logged out');
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('dev')) {
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        if (mainApp) {
            mainApp.style.display = 'flex';
        }
        if (userNameDisplay) {
            userNameDisplay.textContent = 'Developer';
        }
        if (userInitials) {
            userInitials.textContent = 'DV';
        }
        paintAvatar(userAvatar, userInitials, 'Developer', '', 'DV');
        addSafeActivity('Developer mode activated');
    }
}

console.log('Auth module loaded');
