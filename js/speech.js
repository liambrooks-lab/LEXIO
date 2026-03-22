/**
 * LEXIO - Speech Synthesis Module
 * Fixed: Corrected template literal syntax and voice initialization
 */

document.addEventListener('DOMContentLoaded', function() {
    initSpeech();
});

function initSpeech() {
    const synth = window.speechSynthesis;
    let voices = [];
    let currentUtterance = null;
    let isReading = false;
    let isPaused = false;
    let currentWordIndex = 0;
    let allWords = [];
    let wordElements = [];

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedRange = document.getElementById('speedRange');
    const pitchRange = document.getElementById('pitchRange');
    const speedValue = document.getElementById('speedValue');
    const pitchValue = document.getElementById('pitchValue');
    const voiceSelect = document.getElementById('voiceSelect');
    const exportMp3Btn = document.getElementById('exportMp3Btn');
    const exportWavBtn = document.getElementById('exportWavBtn');

    function showSafeStatus(message, type = 'info') {
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, type);
        } else {
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.style.display = 'block';
                const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
                statusEl.style.background = colors[type] + '20';
                statusEl.style.color = colors[type];
                statusEl.style.border = `1px solid ${colors[type]}40`;
                if (type !== 'error' && type !== 'Reading...') {
                    setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 3000);
                }
            }
        }
    }

    function initVoices() {
        if (!synth) return;
        voices = synth.getVoices();
        if (voices.length === 0) {
            synth.onvoiceschanged = () => {
                voices = synth.getVoices();
                populateVoiceSelect();
            };
        } else {
            populateVoiceSelect();
        }
    }

    function populateVoiceSelect() {
        if (!voiceSelect) return;
        voiceSelect.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = 'default';
        defaultOption.textContent = 'Select Enterprise Voice';
        voiceSelect.appendChild(defaultOption);
        
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        
        // FIX: Using correct backticks and ${index} syntax to prevent frontend crash
        englishVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voice.name;
            // Using a template literal correctly here
            option.textContent = `${voice.name.replace(/\s*\(.+\)\s*/g, '')} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    function clearHighlights() {
        if (wordElements) wordElements.forEach(el => el && el.classList.remove('highlighted'));
    }

    function highlightWord(index) {
        clearHighlights();
        if (wordElements && wordElements[index]) {
            wordElements[index].classList.add('highlighted');
            wordElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const progressBar = document.getElementById('progressBar');
            if (progressBar && allWords.length > 0) {
                progressBar.style.width = ((index + 1) / allWords.length * 100) + '%';
            }
        }
    }

    function stopReading() {
        if (synth) synth.cancel();
        isReading = false;
        isPaused = false;
        currentWordIndex = 0;
        clearHighlights();
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (resumeBtn) resumeBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
        showSafeStatus('Stopped');
    }

    function speakWord(index) {
        if (!synth || !allWords || index >= allWords.length) {
            stopReading();
            return;
        }
        
        currentUtterance = new SpeechSynthesisUtterance(allWords[index]);
        if (voiceSelect && voiceSelect.value !== 'default') {
            const v = voices.find(v => v.name === voiceSelect.value);
            if (v) currentUtterance.voice = v;
        }
        
        currentUtterance.rate = parseFloat(speedRange ? speedRange.value : 1);
        currentUtterance.pitch = parseFloat(pitchRange ? pitchRange.value : 1);
        
        currentUtterance.onend = () => {
            currentWordIndex++;
            if (isReading && !isPaused) speakWord(currentWordIndex);
        };

        synth.speak(currentUtterance);
        highlightWord(index);
    }

    function startReading(startIndex = 0) {
        const input = document.getElementById('inputText');
        if (!input || !input.value.trim()) return showSafeStatus('No text found', 'error');
        
        allWords = input.value.trim().split(/\s+/);
        const display = document.getElementById('displayText');
        if (display) wordElements = Array.from(display.querySelectorAll('.word'));
        
        stopReading();
        currentWordIndex = startIndex;
        isReading = true;
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
        showSafeStatus('Reading...');
        speakWord(currentWordIndex);
    }

    if (startBtn) startBtn.addEventListener('click', () => startReading(0));
    if (stopBtn) stopBtn.addEventListener('click', stopReading);
    if (pauseBtn) pauseBtn.addEventListener('click', () => {
        if (synth && isReading) { synth.pause(); isPaused = true; pauseBtn.disabled = true; resumeBtn.disabled = false; }
    });
    if (resumeBtn) resumeBtn.addEventListener('click', () => {
        if (synth && isPaused) { synth.resume(); isPaused = false; pauseBtn.disabled = false; resumeBtn.disabled = true; }
    });

    if (synth) initVoices();
    window.speechModule = { startReading, stopReading };
}