/**
 * LEXIO - Speech Synthesis Module
 */
document.addEventListener('DOMContentLoaded', function() {
    initSpeech();
});

function initSpeech() {
    const synth = window.speechSynthesis;
    let voices = [];
    let currentUtterance = null;
    let isPaused = false;

    // DOM bindings
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const voiceSelect = document.getElementById('voiceSelect');
    const inputText = document.getElementById('inputText');
    const displayText = document.getElementById('displayText');

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
        voiceSelect.innerHTML = '<option value="default">System Default Voice</option>';
        voices.filter(v => v.lang.startsWith('en')).forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name.replace(/\s*\(.+\)\s*/g, '')} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    function highlightWord(index) {
        if (window.wordElements) {
            window.wordElements.forEach(el => el.classList.remove('highlighted'));
            if (window.wordElements[index]) {
                window.wordElements[index].classList.add('highlighted');
                window.wordElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        const progressBar = document.getElementById('progressBar');
        if (progressBar && window.allWords.length > 0) {
            progressBar.style.width = ((index + 1) / window.allWords.length * 100) + '%';
        }
    }

    function stopReading() {
        if (synth) synth.cancel();
        window.isReading = false;
        isPaused = false;
        
        if (window.wordElements) window.wordElements.forEach(el => el.classList.remove('highlighted'));
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (resumeBtn) resumeBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
        
        // Swap back to text area mode
        if (inputText && displayText) {
            displayText.style.display = 'none';
            inputText.style.display = 'block';
        }
        
        window.showStatus('Ready', 'info');
        const progressBar = document.getElementById('progressBar');
        if (progressBar) progressBar.style.width = '0%';
    }

    function speakWord(index) {
        if (!synth || !window.allWords || index >= window.allWords.length) {
            stopReading();
            return;
        }
        
        currentUtterance = new SpeechSynthesisUtterance(window.allWords[index]);
        if (voiceSelect && voiceSelect.value !== 'default') {
            const v = voices.find(v => v.name === voiceSelect.value);
            if (v) currentUtterance.voice = v;
        }
        
        currentUtterance.rate = parseFloat(document.getElementById('speedRange')?.value || 1);
        currentUtterance.pitch = parseFloat(document.getElementById('pitchRange')?.value || 1);
        
        currentUtterance.onend = () => {
            window.currentWordIndex++;
            if (window.isReading && !isPaused) speakWord(window.currentWordIndex);
        };

        synth.speak(currentUtterance);
        highlightWord(index);
    }

    function startReading(startIndex = 0) {
        if (!inputText || !inputText.value.trim()) return window.showStatus('Please enter text first', 'warning');
        
        // Prepare display text logic
        window.updateDisplayText(inputText.value);
        inputText.style.display = 'none';
        displayText.style.display = 'block';

        stopReading(); // Clear any existing speech
        window.currentWordIndex = startIndex;
        window.isReading = true;
        
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
        
        window.showStatus('Reading Active...', 'success');
        speakWord(window.currentWordIndex);
    }

    // Attach core listeners
    if (startBtn) startBtn.addEventListener('click', () => startReading(0));
    if (stopBtn) stopBtn.addEventListener('click', stopReading);
    if (pauseBtn) pauseBtn.addEventListener('click', () => {
        if (synth && window.isReading) { 
            synth.pause(); isPaused = true; 
            pauseBtn.disabled = true; resumeBtn.disabled = false; 
            window.showStatus('Paused', 'warning');
        }
    });
    if (resumeBtn) resumeBtn.addEventListener('click', () => {
        if (synth && isPaused) { 
            synth.resume(); isPaused = false; 
            pauseBtn.disabled = false; resumeBtn.disabled = true;
            window.showStatus('Reading Active...', 'success');
        }
    });

    if (synth) initVoices();
    
    // Expose API globally for inline click-to-read
    window.speechModule = { startReading, stopReading };
}