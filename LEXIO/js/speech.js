/**
 * LEXIO - Speech Synthesis Module
 */

document.addEventListener('DOMContentLoaded', function() {
    initSpeech();
});

function initSpeech() {
    const synth = window.speechSynthesis;
    const inputText = document.getElementById('inputText');
    const displayText = document.getElementById('displayText');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedRange = document.getElementById('speedRange');
    const voiceSelect = document.getElementById('voiceSelect');

    let voices = [];
    let currentUtterance = null;
    let isReading = false;
    let isPaused = false;
    let highlightedIndex = -1;

    window.synth = synth;

    function ensureStatusElement() {
        let statusEl = document.getElementById('status');

        if (!statusEl && displayText && displayText.parentElement) {
            statusEl = document.createElement('div');
            statusEl.id = 'status';
            statusEl.className = 'status';
            statusEl.style.marginTop = '12px';
            statusEl.style.padding = '10px 12px';
            statusEl.style.borderRadius = '10px';
            statusEl.style.display = 'none';
            displayText.parentElement.appendChild(statusEl);
        }

        return statusEl;
    }

    function showStatus(message, type) {
        const safeType = type || 'info';

        if (typeof window.showStatus === 'function') {
            window.showStatus(message, safeType);
            return;
        }

        const statusEl = ensureStatusElement();
        if (!statusEl) {
            return;
        }

        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        const color = colors[safeType] || colors.info;

        statusEl.textContent = message;
        statusEl.style.display = 'block';
        statusEl.style.color = color;
        statusEl.style.background = color + '14';
        statusEl.style.border = '1px solid ' + color + '33';

        if (safeType !== 'error') {
            window.clearTimeout(showStatus.hideTimer);
            showStatus.hideTimer = window.setTimeout(function() {
                if (statusEl) {
                    statusEl.style.display = 'none';
                }
            }, 2500);
        }
    }

    function setButtonState() {
        if (startBtn) {
            startBtn.disabled = isReading && !isPaused;
        }
        if (pauseBtn) {
            pauseBtn.disabled = !isReading || isPaused;
        }
        if (resumeBtn) {
            resumeBtn.disabled = !isReading || !isPaused;
        }
        if (stopBtn) {
            stopBtn.disabled = !isReading;
        }
    }

    function clearHighlight() {
        if (!displayText) {
            return;
        }

        const previous = displayText.querySelector('.word.highlighted');
        if (previous) {
            previous.classList.remove('highlighted');
        }
        highlightedIndex = -1;
    }

    function highlightWordByCharIndex(charIndex) {
        if (!displayText || charIndex < 0) {
            return;
        }

        const words = displayText.querySelectorAll('.word');
        let activeIndex = -1;

        for (let index = 0; index < words.length; index += 1) {
            const word = words[index];
            const start = Number(word.dataset.start || -1);
            const end = Number(word.dataset.end || -1);

            if (charIndex >= start && charIndex < end) {
                activeIndex = index;
                break;
            }
        }

        if (activeIndex === -1 || activeIndex === highlightedIndex) {
            return;
        }

        clearHighlight();
        words[activeIndex].classList.add('highlighted');
        words[activeIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        highlightedIndex = activeIndex;
    }

    function renderPreview() {
        if (!inputText || !displayText) {
            return;
        }

        const text = inputText.value || '';
        clearHighlight();

        if (!text.trim()) {
            displayText.innerHTML = '';
            return;
        }

        const tokens = text.match(/\S+|\s+/g) || [];
        let cursor = 0;

        displayText.innerHTML = tokens.map(function(token) {
            const start = cursor;
            cursor += token.length;

            if (/^\s+$/.test(token)) {
                return token
                    .replace(/ /g, '&nbsp;')
                    .replace(/\n/g, '<br>');
            }

            const escapedToken = token
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');

            return '<span class="word" data-start="' + start + '" data-end="' + cursor + '">' + escapedToken + '</span>';
        }).join('');
    }

    function populateVoiceSelect() {
        if (!voiceSelect) {
            return;
        }

        voices = synth ? synth.getVoices() : [];
        voiceSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = voices.length ? 'Default Browser Voice' : 'No voices available';
        voiceSelect.appendChild(defaultOption);

        voices
            .filter(function(voice) {
                return voice.lang && voice.lang.toLowerCase().startsWith('en');
            })
            .sort(function(a, b) {
                return a.name.localeCompare(b.name);
            })
            .forEach(function(voice) {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = voice.name + ' (' + voice.lang + ')';
                voiceSelect.appendChild(option);
            });
    }

    function stopReading(options) {
        const shouldNotify = !options || options.notify !== false;

        if (synth) {
            synth.cancel();
        }

        currentUtterance = null;
        isReading = false;
        isPaused = false;
        clearHighlight();
        setButtonState();

        if (shouldNotify) {
            showStatus('Speech stopped', 'info');
        }
    }

    function startReading() {
        if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
            showStatus('Speech synthesis is not supported in this browser', 'error');
            return;
        }

        if (!inputText) {
            return;
        }

        const text = inputText.value.trim();
        if (!text) {
            showStatus('Enter some text before starting playback', 'warning');
            return;
        }

        stopReading({ notify: false });
        renderPreview();

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = speedRange ? Number(speedRange.value) : 1;

        if (voiceSelect && voiceSelect.value) {
            const selectedVoice = voices.find(function(voice) {
                return voice.name === voiceSelect.value;
            });
            if (selectedVoice) {
                currentUtterance.voice = selectedVoice;
            }
        }

        currentUtterance.onstart = function() {
            isReading = true;
            isPaused = false;
            setButtonState();
            showStatus('Reading started', 'success');
        };

        currentUtterance.onboundary = function(event) {
            if (event.name === 'word') {
                highlightWordByCharIndex(event.charIndex);
            }
        };

        currentUtterance.onpause = function() {
            isPaused = true;
            setButtonState();
            showStatus('Speech paused', 'info');
        };

        currentUtterance.onresume = function() {
            isPaused = false;
            setButtonState();
            showStatus('Speech resumed', 'success');
        };

        currentUtterance.onerror = function() {
            stopReading({ notify: false });
            showStatus('Speech playback failed', 'error');
        };

        currentUtterance.onend = function() {
            stopReading({ notify: false });
            showStatus('Finished reading', 'success');
        };

        synth.speak(currentUtterance);
    }

    if (inputText) {
        inputText.addEventListener('input', renderPreview);
    }

    if (startBtn) {
        startBtn.addEventListener('click', startReading);
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (!synth || !isReading || isPaused) {
                return;
            }
            synth.pause();
        });
    }

    if (resumeBtn) {
        resumeBtn.addEventListener('click', function() {
            if (!synth || !isReading || !isPaused) {
                return;
            }
            synth.resume();
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            stopReading({ notify: true });
        });
    }

    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
        if (voiceSelect) {
            voiceSelect.innerHTML = '<option>Speech not supported</option>';
            voiceSelect.disabled = true;
        }
        if (startBtn) {
            startBtn.disabled = true;
        }
        showStatus('This browser does not support speech synthesis', 'error');
        return;
    }

    populateVoiceSelect();
    if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = populateVoiceSelect;
    }

    renderPreview();
    setButtonState();

    window.speechModule = {
        startReading: startReading,
        stopReading: stopReading,
        renderPreview: renderPreview
    };
}
