/**
 * LEXIO - Enterprise Text to Speech Studio
 * Main Integration File
 * @version 1.0.1
 */

// 1. Synchronously define globals so other modules can access them immediately
window.allWords = [];
window.wordElements = [];
window.currentWordIndex = 0;
window.isReading = false;

window.showStatus = function(message, type = 'success') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return console.log(`[${type}] ${message}`);
    
    statusEl.textContent = message;
    statusEl.style.display = 'inline-block';
    
    const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
    statusEl.style.background = colors[type] + '20';
    statusEl.style.color = colors[type];
    statusEl.style.borderColor = `${colors[type]}40`;
    
    if (type !== 'error' && type !== 'info' && message !== 'Reading...') {
        setTimeout(() => {
            if (statusEl && !window.isReading) statusEl.style.display = 'none';
        }, 3000);
    }
};

window.updateDisplayText = function(text) {
    const inputText = document.getElementById('inputText');
    const displayText = document.getElementById('displayText');
    if (!displayText || !inputText) return;
    
    if (!text || text.trim() === '') {
        displayText.style.display = 'none';
        inputText.style.display = 'block';
        window.allWords = [];
        window.wordElements = [];
        return;
    }
    
    const words = text.split(/\s+/).filter(w => w && w.length > 0);
    window.allWords = words;
    
    let html = '';
    words.forEach((word, index) => {
        const safeWord = word.replace(/[&<>"]/g, m => {
            if (m === '&') return '&amp;'; if (m === '<') return '&lt;';
            if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
            return m;
        });
        html += `<span class="word" data-index="${index}">${safeWord}</span> `;
    });
    
    displayText.innerHTML = html;
    window.wordElements = Array.from(displayText.querySelectorAll('.word'));
    
    // Add click-to-read functionality to words
    window.wordElements.forEach((el, index) => {
        el.addEventListener('click', () => {
            if (typeof window.speechModule !== 'undefined') {
                window.speechModule.startReading(index);
            }
        });
    });
};

// 2. Initialize DOM bindings
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 LEXIO Core initializing...');
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }, 800);

    initEventListeners();
});

function initEventListeners() {
    // Clear text button (Updated ID)
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const inputText = document.getElementById('inputText');
            const displayText = document.getElementById('displayText');
            if (inputText) inputText.value = '';
            if (displayText) displayText.style.display = 'none';
            inputText.style.display = 'block';
            updateCounters('');
            window.updateDisplayText('');
            window.showStatus('Text cleared', 'info');
        });
    }
    
    // Input text dynamic tracking
    const inputText = document.getElementById('inputText');
    if (inputText) {
        inputText.addEventListener('input', (e) => {
            const text = e.target.value || '';
            updateCounters(text);
        });
    }

    // Slider real-time updates
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    if (speedRange && speedValue) {
        speedRange.addEventListener('input', (e) => speedValue.textContent = `${e.target.value}x`);
    }

    const pitchRange = document.getElementById('pitchRange');
    const pitchValue = document.getElementById('pitchValue');
    if (pitchRange && pitchValue) {
        pitchRange.addEventListener('input', (e) => pitchValue.textContent = e.target.value);
    }

    // Developer mode bypass (?dev in URL)
    if (new URLSearchParams(window.location.search).has('dev')) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        window.showStatus('Developer mode active', 'warning');
    }
}

function updateCounters(text) {
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
        const minutes = wordCount / 150; // Average reading speed
        const seconds = Math.round(minutes * 60);
        timeEstimateEl.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds/60)}m ${seconds%60}s`;
    }
}