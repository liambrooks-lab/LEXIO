/**
 * LEXIO - Enterprise Text to Speech Studio
 * Main Integration File
 * @version 1.0.0
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 LEXIO initializing...');
    initApp();
});

function initApp() {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);

    // Global variables
    window.allWords = [];
    window.wordElements = [];
    window.currentWordIndex = 0;
    window.isReading = false;

    // Initialize event listeners
    initEventListeners();
    
    console.log('✅ LEXIO ready!');
}

function initEventListeners() {
    // Clear text button
    const clearBtn = document.getElementById('clearTextBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const inputText = document.getElementById('inputText');
            const charCounter = document.getElementById('charCounter');
            if (inputText) {
                inputText.value = '';
                if (charCounter) charCounter.textContent = '0/50000';
                updateDisplayText('');
                showStatus('Text cleared');
            }
        });
    }
    
    // Previous/Next word navigation
    const prevBtn = document.getElementById('previousWord');
    const nextBtn = document.getElementById('nextWord');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (window.currentWordIndex > 0 && typeof window.startReading === 'function') {
                window.startReading(window.currentWordIndex - 1);
            } else if (window.currentWordIndex > 0 && typeof startReading === 'function') {
                startReading(window.currentWordIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (window.allWords && window.currentWordIndex < window.allWords.length - 1) {
                if (typeof window.startReading === 'function') {
                    window.startReading(window.currentWordIndex + 1);
                } else if (typeof startReading === 'function') {
                    startReading(window.currentWordIndex + 1);
                }
            }
        });
    }
    
    // Input text with counters
    const inputText = document.getElementById('inputText');
    if (inputText) {
        inputText.addEventListener('input', (e) => {
            const text = e.target.value || '';
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
            const charCount = text.length;
            
            const charCounter = document.getElementById('charCounter');
            const wordCountEl = document.getElementById('wordCount');
            const charCountEl = document.getElementById('charCount');
            const timeEstimateEl = document.getElementById('timeEstimate');
            
            if (charCounter) charCounter.textContent = `${charCount}/50000`;
            if (wordCountEl) wordCountEl.textContent = wordCount;
            if (charCountEl) charCountEl.textContent = charCount;
            
            if (timeEstimateEl) {
                const minutes = wordCount / 150;
                const seconds = Math.round(minutes * 60);
                timeEstimateEl.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds/60)}m ${seconds%60}s`;
            }
            
            updateDisplayText(text);
        });
    }

    // Developer mode bypass (?dev in URL)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('dev')) {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        if (loginPage && mainApp) {
            loginPage.style.display = 'none';
            mainApp.style.display = 'flex';
            const userNameDisplay = document.getElementById('userName');
            if (userNameDisplay) userNameDisplay.textContent = 'Developer';
            const userInitials = document.getElementById('userInitials');
            if (userInitials) userInitials.textContent = 'DV';
            showStatus('Developer mode active', 'info');
        }
    }
}

function updateDisplayText(text) {
    const displayText = document.getElementById('displayText');
    if (!displayText) return;
    
    if (!text || text.trim() === '') {
        displayText.innerHTML = '<span class="placeholder">Your text will appear here with real-time word highlighting...</span>';
        window.allWords = [];
        window.wordElements = [];
        return;
    }
    
    const words = text.split(/\s+/).filter(w => w && w.length > 0);
    window.allWords = words;
    
    let html = '';
    words.forEach((word, index) => {
        const safeWord = word.replace(/[&<>"]/g, m => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
        html += `<span class="word" data-index="${index}">${safeWord}</span> `;
    });
    
    displayText.innerHTML = html;
    window.wordElements = Array.from(displayText.querySelectorAll('.word'));
}

function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status');
    if (!statusEl) {
        console.log(`[${type}] ${message}`);
        return;
    }
    
    statusEl.textContent = message;
    statusEl.style.display = 'inline-block';
    
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    
    statusEl.style.background = colors[type] + '20';
    statusEl.style.color = colors[type];
    statusEl.style.border = `1px solid ${colors[type]}40`;
    
    if (type !== 'error' && type !== 'Reading...') {
        setTimeout(() => {
            if (statusEl && !window.isReading) statusEl.style.display = 'none';
        }, 3000);
    }
}

window.showStatus = showStatus;
window.updateDisplayText = updateDisplayText;
window.testLexio = function() {
    console.log('✅ LEXIO test function called');
    showStatus('LEXIO is working!', 'success');
    return 'LEXIO ready';
};

console.log('📝 script.js loaded successfully');