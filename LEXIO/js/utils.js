/**
 * LEXIO - Utility Functions
 */

// Wait for DOM to be fully loaded (only needed for DOM-dependent functions)
document.addEventListener('DOMContentLoaded', function() {
    // Nothing needed here, but keeping for consistency
    console.log('✅ Utils module loaded');
});

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    if (typeof func !== 'function') {
        console.error('debounce requires a function');
        return function() {};
    }
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    if (typeof func !== 'function') {
        console.error('throttle requires a function');
        return function() {};
    }
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
    if (bytes === undefined || bytes === null) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number (simple)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // More flexible phone validation
    const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Generate user initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getUserInitials(name) {
    if (!name || typeof name !== 'string') return 'U';
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .filter(char => char && char.match(/[A-Za-z]/))
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'U';
}

/**
 * Add to activity log
 * @param {string} message - Activity message
 */
function addActivity(message) {
    if (!message) return;
    
    const activityLog = document.getElementById('activityLog');
    if (!activityLog) {
        console.log('Activity:', message);
        return;
    }
    
    try {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const timestamp = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        item.textContent = `[${timestamp}] ${message}`;
        
        activityLog.insertBefore(item, activityLog.firstChild);
        
        // Keep only last 10 activities
        while (activityLog.children.length > 10) {
            activityLog.removeChild(activityLog.lastChild);
        }
    } catch (e) {
        console.error('Error adding activity:', e);
    }
}

/**
 * Safe JSON parse
 * @param {string} str - JSON string to parse
 * @param {any} fallback - Fallback value if parse fails
 * @returns {any} Parsed object or fallback
 */
function safeJsonParse(str, fallback = null) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback;
    }
}

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
function generateId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Check if browser supports speech synthesis
 * @returns {boolean} True if supported
 */
function isSpeechSupported() {
    return 'speechSynthesis' in window;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 50) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
function capitalizeFirst(text) {
    if (!text || typeof text !== 'string') return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Get current timestamp
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

// Export all functions to window
window.utils = {
    debounce,
    throttle,
    formatFileSize,
    validateEmail,
    validatePhone,
    getUserInitials,
    addActivity,
    safeJsonParse,
    generateId,
    isSpeechSupported,
    truncateText,
    capitalizeFirst,
    getTimestamp
};

// Also export individually for backward compatibility
window.debounce = debounce;
window.throttle = throttle;
window.formatFileSize = formatFileSize;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.getUserInitials = getUserInitials;
window.addActivity = addActivity;
window.safeJsonParse = safeJsonParse;
window.generateId = generateId;
window.isSpeechSupported = isSpeechSupported;
window.truncateText = truncateText;
window.capitalizeFirst = capitalizeFirst;
window.getTimestamp = getTimestamp;

console.log('✅ Utils module loaded with all utility functions');