/**
 * LEXIO - Speech Engine
 */
(function() {
    const ACCENT_LABELS = {
        AU: 'Australia',
        CA: 'Canada',
        ES: 'Spain',
        GB: 'United Kingdom',
        IN: 'India',
        IT: 'Italy',
        MX: 'Mexico',
        SA: 'Saudi Arabia',
        US: 'United States',
        DEFAULT: 'Default'
    };

    const playback = {
        synth: null,
        voices: [],
        readingPlan: [],
        currentChunkIndex: 0,
        isReading: false,
        isPaused: false,
        currentWordIndex: -1,
        activeUtterance: null,
        ui: {}
    };

    window.lexioPlayback = playback;

    document.addEventListener('DOMContentLoaded', initSpeech);

    function initSpeech() {
        playback.synth = window.speechSynthesis || null;
        playback.ui = {
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resumeBtn: document.getElementById('resumeBtn'),
            stopBtn: document.getElementById('stopBtn'),
            voiceSelect: document.getElementById('voiceSelect'),
            languageSelect: document.getElementById('languageSelect'),
            accentSelect: document.getElementById('accentSelect'),
            voicePersonaSelect: document.getElementById('voicePersonaSelect'),
            readingModeSelect: document.getElementById('readingModeSelect'),
            speedRange: document.getElementById('speedRange'),
            pitchRange: document.getElementById('pitchRange'),
            smartChunking: document.getElementById('smartChunking'),
            voiceMeta: document.getElementById('voiceMeta'),
            voiceCoverage: document.getElementById('voiceCoverage')
        };

        bindSpeechControls();

        if (!playback.synth || typeof window.SpeechSynthesisUtterance === 'undefined') {
            disableSpeechUi('Speech synthesis is not supported in this browser.');
            return;
        }

        loadVoices();
        if (typeof playback.synth.onvoiceschanged !== 'undefined') {
            playback.synth.onvoiceschanged = loadVoices;
        }

        window.speechModule = {
            startReading: startReading,
            stopReading: stopReading,
            refreshVoiceCatalog: refreshVoiceCatalog,
            handleDocumentUpdated: handleDocumentUpdated
        };
    }

    function bindSpeechControls() {
        if (playback.ui.startBtn) {
            playback.ui.startBtn.addEventListener('click', function() {
                startReading(0);
            });
        }
        if (playback.ui.pauseBtn) {
            playback.ui.pauseBtn.addEventListener('click', pauseReading);
        }
        if (playback.ui.resumeBtn) {
            playback.ui.resumeBtn.addEventListener('click', resumeReading);
        }
        if (playback.ui.stopBtn) {
            playback.ui.stopBtn.addEventListener('click', function() {
                stopReading();
            });
        }

        ['languageSelect', 'accentSelect', 'voicePersonaSelect'].forEach(function(key) {
            if (playback.ui[key]) {
                playback.ui[key].addEventListener('change', refreshVoiceCatalog);
            }
        });
    }

    function disableSpeechUi(message) {
        if (playback.ui.voiceSelect) {
            playback.ui.voiceSelect.innerHTML = '<option value="">Speech not supported</option>';
            playback.ui.voiceSelect.disabled = true;
        }
        if (playback.ui.startBtn) {
            playback.ui.startBtn.disabled = true;
        }
        window.showStatus(message, 'error');
    }

    function handleDocumentUpdated() {
        stopReading({ quiet: true, preserveProgress: false });
        refreshVoiceCatalog();
    }

    function loadVoices() {
        playback.voices = playback.synth.getVoices().slice();
        refreshVoiceCatalog();
    }

    function refreshVoiceCatalog() {
        const voiceSelect = playback.ui.voiceSelect;
        const accentSelect = playback.ui.accentSelect;
        const coverageEl = playback.ui.voiceCoverage;
        if (!voiceSelect || !accentSelect) {
            return;
        }

        const language = getLanguagePreference();
        const matchingLanguage = playback.voices.filter(function(voice) {
            return normalizeBaseLang(voice.lang) === language;
        });
        const accentOptions = collectAccents(matchingLanguage);
        const previousAccent = accentSelect.value || 'auto';
        const previousVoice = voiceSelect.value || '';

        accentSelect.innerHTML = '<option value="auto">Best available accent</option>';
        accentOptions.forEach(function(option) {
            const node = document.createElement('option');
            node.value = option.code;
            node.textContent = option.label;
            accentSelect.appendChild(node);
        });
        if (accentOptions.some(function(option) { return option.code === previousAccent; })) {
            accentSelect.value = previousAccent;
        }

        const persona = playback.ui.voicePersonaSelect ? playback.ui.voicePersonaSelect.value : 'any';
        const accent = accentSelect.value || 'auto';
        const filtered = matchingLanguage.filter(function(voice) {
            if (accent !== 'auto' && normalizeAccentCode(voice.lang) !== accent) {
                return false;
            }
            return persona === 'any' || inferPersona(voice) === persona;
        });

        const finalVoices = filtered.length ? filtered : (matchingLanguage.length ? matchingLanguage : playback.voices);
        voiceSelect.innerHTML = '';
        if (!finalVoices.length) {
            voiceSelect.innerHTML = '<option value="">No voices found</option>';
            voiceSelect.disabled = true;
            if (coverageEl) {
                coverageEl.textContent = 'Unavailable';
            }
            return;
        }

        voiceSelect.disabled = false;
        finalVoices.slice().sort(function(a, b) {
            return a.name.localeCompare(b.name);
        }).forEach(function(voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name + ' - ' + formatVoiceMeta(voice);
            voiceSelect.appendChild(option);
        });
        if (previousVoice && finalVoices.some(function(voice) { return voice.name === previousVoice; })) {
            voiceSelect.value = previousVoice;
        }

        if (playback.ui.voiceMeta) {
            playback.ui.voiceMeta.textContent = buildVoiceMessage(language, matchingLanguage.length, filtered.length, finalVoices.length, persona);
        }
        if (coverageEl) {
            coverageEl.textContent = finalVoices.length + ' voices';
        }
    }

    function startReading(requestedStartIndex) {
        const app = window.lexioApp;
        if (!app || !app.getState) {
            return;
        }
        const documentState = app.getState();
        if (!documentState.words.length) {
            window.showStatus('Load a document or paste text before starting narration.', 'warning');
            return;
        }

        const startIndex = typeof requestedStartIndex === 'number' && requestedStartIndex >= 0 ? requestedStartIndex : 0;
        const plan = buildReadingPlan(documentState, startIndex);
        if (!plan.length) {
            window.showStatus('LEXIO could not prepare a reading plan for this document.', 'error');
            return;
        }

        stopReading({ quiet: true, preserveProgress: true });
        playback.readingPlan = plan;
        playback.currentChunkIndex = 0;
        playback.currentWordIndex = startIndex;
        playback.isReading = true;
        playback.isPaused = false;
        updateButtonState();
        speakCurrentChunk();
    }

    function speakCurrentChunk() {
        const chunk = playback.readingPlan[playback.currentChunkIndex];
        if (!chunk) {
            finishReading();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(chunk.text);
        const voice = resolveVoice();
        utterance.voice = voice;
        utterance.lang = voice && voice.lang ? voice.lang : localeForLanguage(getLanguagePreference());
        utterance.rate = playback.ui.speedRange ? Number(playback.ui.speedRange.value) : 1;
        utterance.pitch = playback.ui.pitchRange ? Number(playback.ui.pitchRange.value) : 1;
        utterance.volume = 1;

        utterance.onstart = function() {
            playback.activeUtterance = utterance;
            window.showStatus('Narration in progress', 'success');
            if (window.lexioApp) {
                window.lexioApp.updateProgress(wordProgress(chunk.startWordIndex), 'Reading ' + chunk.label);
                window.lexioApp.setActiveWord(chunk.startWordIndex, { scroll: true });
            }
        };

        utterance.onboundary = function(event) {
            if (typeof event.charIndex !== 'number') {
                return;
            }
            const activeWord = mapCharIndexToWord(chunk, event.charIndex);
            if (typeof activeWord === 'number' && window.lexioApp) {
                playback.currentWordIndex = activeWord;
                window.lexioApp.setActiveWord(activeWord, { scroll: true });
                window.lexioApp.updateProgress(wordProgress(activeWord), 'Reading ' + chunk.label);
            }
        };

        utterance.onerror = function() {
            stopReading({ quiet: true, preserveProgress: false });
            window.showStatus('Speech playback failed on this browser voice.', 'error');
        };

        utterance.onend = function() {
            if (!playback.isReading) {
                return;
            }
            playback.currentChunkIndex += 1;
            if (playback.currentChunkIndex >= playback.readingPlan.length) {
                finishReading();
                return;
            }
            speakCurrentChunk();
        };

        playback.synth.speak(utterance);
    }

    function pauseReading() {
        if (!playback.synth || !playback.isReading || playback.isPaused) {
            return;
        }
        playback.synth.pause();
        playback.isPaused = true;
        updateButtonState();
        window.showStatus('Narration paused', 'warning');
    }

    function resumeReading() {
        if (!playback.synth || !playback.isReading || !playback.isPaused) {
            return;
        }
        playback.synth.resume();
        playback.isPaused = false;
        updateButtonState();
        window.showStatus('Narration resumed', 'success');
    }

    function stopReading(options) {
        const settings = options || {};
        if (playback.synth) {
            playback.synth.cancel();
        }
        playback.isReading = false;
        playback.isPaused = false;
        playback.activeUtterance = null;
        playback.readingPlan = [];
        playback.currentChunkIndex = 0;
        updateButtonState();

        if (!settings.preserveProgress && window.lexioApp) {
            window.lexioApp.clearActiveWord();
            window.lexioApp.updateProgress(0, 'Idle');
        }
        if (!settings.quiet) {
            window.showStatus('Narration stopped', 'info');
        }
    }

    function finishReading() {
        playback.isReading = false;
        playback.isPaused = false;
        playback.activeUtterance = null;
        updateButtonState();
        if (window.lexioApp) {
            window.lexioApp.updateProgress(100, 'Complete');
        }
        window.showStatus('Document narration complete', 'success');
    }

    function updateButtonState() {
        if (playback.ui.startBtn) { playback.ui.startBtn.disabled = playback.isReading && !playback.isPaused; }
        if (playback.ui.pauseBtn) { playback.ui.pauseBtn.disabled = !playback.isReading || playback.isPaused; }
        if (playback.ui.resumeBtn) { playback.ui.resumeBtn.disabled = !playback.isReading || !playback.isPaused; }
        if (playback.ui.stopBtn) { playback.ui.stopBtn.disabled = !playback.isReading; }
    }

    function buildReadingPlan(documentState, startWordIndex) {
        const plan = [];
        const smart = !playback.ui.smartChunking || playback.ui.smartChunking.checked;
        const mode = playback.ui.readingModeSelect ? playback.ui.readingModeSelect.value : 'adaptive';
        const maxWords = mode === 'executive' ? 36 : mode === 'study' ? 20 : mode === 'presentation' ? 28 : mode === 'accessibility' ? 16 : 24;

        documentState.sections.forEach(function(section) {
            if (section.endWordIndex < startWordIndex) {
                return;
            }
            const sectionWords = section.text.match(/\S+/g) || [];
            const offset = Math.max(0, startWordIndex - section.startWordIndex);
            const slicedWords = sectionWords.slice(offset);
            if (!slicedWords.length) {
                return;
            }
            const candidates = smart ? splitNaturalChunks(slicedWords, maxWords) : splitByWordCount(slicedWords, maxWords);
            let cursor = section.startWordIndex + offset;
            candidates.forEach(function(candidate, index) {
                const words = candidate.match(/\S+/g) || [];
                if (!words.length) {
                    return;
                }
                plan.push(createChunk(words, cursor, section.label + ' · ' + (index + 1)));
                cursor += words.length;
            });
        });

        return plan;
    }

    function createChunk(words, startWordIndex, label) {
        let charCursor = 0;
        const positions = words.map(function(word, index) {
            const start = charCursor;
            charCursor += word.length + 1;
            return { wordIndex: startWordIndex + index, start: start, end: start + word.length };
        });
        return {
            label: label,
            text: words.join(' '),
            startWordIndex: startWordIndex,
            endWordIndex: startWordIndex + words.length - 1,
            positions: positions
        };
    }

    function splitNaturalChunks(words, maxWords) {
        const sentenceText = words.join(' ');
        const chunks = [];
        sentenceText.split(/(?<=[.!?؟।])\s+/).filter(Boolean).forEach(function(sentence) {
            const wordsInSentence = sentence.match(/\S+/g) || [];
            if (wordsInSentence.length <= maxWords) {
                chunks.push(wordsInSentence.join(' '));
                return;
            }
            sentence.split(/(?<=,|;|:)\s+/).forEach(function(part) {
                const splitWords = part.match(/\S+/g) || [];
                if (splitWords.length <= maxWords) {
                    chunks.push(splitWords.join(' '));
                } else {
                    splitByWordCount(splitWords, maxWords).forEach(function(block) { chunks.push(block); });
                }
            });
        });
        return chunks.length ? chunks : splitByWordCount(words, maxWords);
    }

    function splitByWordCount(words, size) {
        const chunks = [];
        for (let index = 0; index < words.length; index += size) {
            chunks.push(words.slice(index, index + size).join(' '));
        }
        return chunks;
    }

    function mapCharIndexToWord(chunk, charIndex) {
        for (let index = 0; index < chunk.positions.length; index += 1) {
            const pos = chunk.positions[index];
            if (charIndex >= pos.start && charIndex <= pos.end) {
                return pos.wordIndex;
            }
        }
        return chunk.endWordIndex;
    }

    function resolveVoice() {
        if (!playback.ui.voiceSelect || !playback.ui.voiceSelect.value) {
            return playback.voices[0] || null;
        }
        return playback.voices.find(function(voice) { return voice.name === playback.ui.voiceSelect.value; }) || playback.voices[0] || null;
    }

    function getLanguagePreference() {
        return window.lexioApp && window.lexioApp.getPreferredLanguage ? window.lexioApp.getPreferredLanguage() : 'en';
    }

    function wordProgress(wordIndex) {
        const app = window.lexioApp;
        const state = app && app.getState ? app.getState() : null;
        if (!state || !state.words.length) {
            return 0;
        }
        return ((wordIndex + 1) / state.words.length) * 100;
    }

    function normalizeBaseLang(lang) { return (lang || 'en').toLowerCase().split('-')[0]; }
    function normalizeAccentCode(lang) { const parts = (lang || '').split('-'); return parts[1] ? parts[1].toUpperCase() : 'DEFAULT'; }
    function localeForLanguage(language) { return { en: 'en-US', hi: 'hi-IN', ar: 'ar-SA', it: 'it-IT', es: 'es-ES' }[language] || 'en-US'; }

    function collectAccents(voices) {
        const seen = {};
        return voices.map(function(voice) {
            const code = normalizeAccentCode(voice.lang);
            if (seen[code]) { return null; }
            seen[code] = true;
            return { code: code, label: ACCENT_LABELS[code] || code };
        }).filter(Boolean);
    }

    function inferPersona(voice) {
        const name = (voice.name || '').toLowerCase();
        const female = ['female', 'zira', 'aria', 'heera', 'sara', 'hazel', 'jenny', 'neural'];
        const male = ['male', 'david', 'guy', 'mark', 'ravi', 'jorge', 'diego', 'paolo'];
        if (female.some(function(token) { return name.indexOf(token) !== -1; })) { return 'female'; }
        if (male.some(function(token) { return name.indexOf(token) !== -1; })) { return 'male'; }
        return 'neutral';
    }

    function formatVoiceMeta(voice) {
        return (ACCENT_LABELS[normalizeAccentCode(voice.lang)] || normalizeAccentCode(voice.lang)) + ' · ' + inferPersona(voice);
    }

    function buildVoiceMessage(language, languageCount, filteredCount, finalCount, persona) {
        const label = window.lexioLanguageLabels && window.lexioLanguageLabels[language] ? window.lexioLanguageLabels[language] : language.toUpperCase();
        if (!languageCount) {
            return 'No native ' + label + ' voices were found in this browser. LEXIO will fall back to the nearest available system voice.';
        }
        if (persona !== 'any' && !filteredCount) {
            return languageCount + ' ' + label + ' voices found, but no exact ' + persona + ' match was detected. Persona filtering has been relaxed.';
        }
        return finalCount + ' ' + label + ' voices are ready for playback.';
    }
})();
