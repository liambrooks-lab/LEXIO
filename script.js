/**
 * LEXIO - Application Orchestrator
 */
(function() {
    const LANGUAGE_LABELS = {
        auto: 'Auto-detect',
        en: 'English',
        hi: 'Hindi',
        ar: 'Arabic',
        it: 'Italian',
        es: 'Spanish'
    };

    const state = {
        rawText: '',
        cleanedText: '',
        documentMeta: {
            title: 'Manual text',
            kind: 'manual',
            summary: 'Paste text or import a document to start.',
            sections: []
        },
        sections: [],
        words: [],
        wordElements: [],
        activeWordIndex: -1,
        detectedLanguage: 'en',
        focusMode: false
    };

    const els = {};

    window.lexioState = state;
    window.lexioLanguageLabels = LANGUAGE_LABELS;

    window.showStatus = function(message, type) {
        const statusEl = document.getElementById('status');
        const safeType = type || 'info';
        const palette = {
            success: '#4ade80',
            error: '#fb7185',
            warning: '#fbbf24',
            info: '#38bdf8'
        };

        if (!statusEl) {
            console.log('[' + safeType + '] ' + message);
            return;
        }

        statusEl.textContent = message;
        statusEl.style.display = 'inline-flex';
        statusEl.style.borderColor = palette[safeType] || palette.info;
        statusEl.style.color = palette[safeType] || palette.info;
        statusEl.style.background = 'rgba(9, 14, 32, 0.92)';

        window.clearTimeout(window.showStatus.hideTimer);
        if (safeType !== 'error') {
            window.showStatus.hideTimer = window.setTimeout(function() {
                if (!window.lexioPlayback || !window.lexioPlayback.isReading) {
                    statusEl.style.display = 'none';
                }
            }, 2800);
        }
    };

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheElements();
        bindEvents();
        hideLoadingScreen();
        syncSliders();
        renderEmptyState();
        updateAnalytics();
        window.lexioApp = {
            loadDocument: loadDocument,
            getState: function() { return state; },
            getText: function() { return state.cleanedText; },
            getDetectedLanguage: function() { return state.detectedLanguage; },
            getPreferredLanguage: getPreferredLanguage,
            setActiveWord: setActiveWord,
            clearActiveWord: clearActiveWord,
            updateProgress: updateProgress,
            refreshAfterTextChange: refreshFromSourceEditor,
            getWordElement: function(index) { return state.wordElements[index] || null; }
        };
        refreshFromSourceEditor();
    }

    function cacheElements() {
        [
            'inputText', 'documentSurface', 'charCounter', 'wordCountChip', 'wordCount', 'charCount',
            'timeEstimate', 'sectionCount', 'documentSummary', 'detectedLanguage', 'qualityHint',
            'activeDocumentType', 'fileBadge', 'voiceCoverage', 'progressBar', 'progressLabel',
            'playbackLabel', 'languageSelect', 'smartCleanup', 'smartChunking', 'toggleFocusModeBtn',
            'speedRange', 'speedValue', 'pitchRange', 'pitchValue', 'demoBtn', 'clearBtn'
        ].forEach(function(id) {
            els[id] = document.getElementById(id);
        });
    }

    function bindEvents() {
        if (els.inputText) {
            els.inputText.addEventListener('input', refreshFromSourceEditor);
        }

        if (els.clearBtn) {
            els.clearBtn.addEventListener('click', function() {
                if (window.speechModule) {
                    window.speechModule.stopReading({ quiet: true });
                }
                loadDocument({
                    title: 'Manual text',
                    kind: 'manual',
                    text: '',
                    sections: []
                });
                if (els.inputText) {
                    els.inputText.value = '';
                }
                window.showStatus('Workspace cleared', 'info');
            });
        }

        if (els.demoBtn) {
            els.demoBtn.addEventListener('click', loadDemoDocument);
        }

        if (els.toggleFocusModeBtn) {
            els.toggleFocusModeBtn.addEventListener('click', function() {
                state.focusMode = !state.focusMode;
                document.body.classList.toggle('focus-mode', state.focusMode);
                els.toggleFocusModeBtn.innerHTML = state.focusMode
                    ? '<i class="fas fa-compress"></i> Exit focus'
                    : '<i class="fas fa-expand"></i> Focus mode';
            });
        }

        if (els.smartCleanup) {
            els.smartCleanup.addEventListener('change', refreshFromSourceEditor);
        }

        if (els.languageSelect) {
            els.languageSelect.addEventListener('change', function() {
                updateDetectedLanguageUI();
                if (window.speechModule && typeof window.speechModule.refreshVoiceCatalog === 'function') {
                    window.speechModule.refreshVoiceCatalog();
                }
            });
        }

        if (new URLSearchParams(window.location.search).has('dev')) {
            const loginPage = document.getElementById('loginPage');
            const mainApp = document.getElementById('mainApp');
            if (loginPage) {
                loginPage.style.display = 'none';
            }
            if (mainApp) {
                mainApp.style.display = 'flex';
            }
        }
    }

    function hideLoadingScreen() {
        window.setTimeout(function() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (!loadingScreen) {
                return;
            }
            loadingScreen.classList.add('fade-out');
            window.setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 450);
        }, 700);
    }

    function syncSliders() {
        if (els.speedRange && els.speedValue) {
            els.speedValue.textContent = Number(els.speedRange.value).toFixed(2) + 'x';
            els.speedRange.addEventListener('input', function(event) {
                els.speedValue.textContent = Number(event.target.value).toFixed(2) + 'x';
            });
        }

        if (els.pitchRange && els.pitchValue) {
            els.pitchValue.textContent = Number(els.pitchRange.value).toFixed(1);
            els.pitchRange.addEventListener('input', function(event) {
                els.pitchValue.textContent = Number(event.target.value).toFixed(1);
            });
        }
    }

    function loadDemoDocument() {
        const demoText = [
            'Hello and welcome to LEXIO. This studio reads real documents in a smoother, more natural way.',
            'You can switch between English, Hindi, Arabic, Italian, and Spanish, filter by accent, and choose a voice persona when your browser provides matching voices.',
            'Import a PDF, DOCX, PPTX, TXT, Markdown, CSV, JSON, or RTF file. LEXIO will rebuild the document into a reading surface and highlight the words as they are spoken.'
        ].join('\n\n');

        loadDocument({
            title: 'LEXIO product sample',
            kind: 'demo',
            text: demoText,
            sections: demoText.split(/\n\n+/).map(function(sectionText, index) {
                return {
                    label: 'Brief ' + (index + 1),
                    kind: 'section',
                    text: sectionText
                };
            })
        });
        window.showStatus('Sample document loaded', 'success');
    }

    function refreshFromSourceEditor() {
        if (!els.inputText) {
            return;
        }

        const sourceText = els.inputText.value || '';
        loadDocument({
            title: state.documentMeta.kind === 'manual' ? 'Manual text' : state.documentMeta.title,
            kind: state.documentMeta.kind === 'manual' ? 'manual' : state.documentMeta.kind,
            text: sourceText,
            sections: sourceText.trim() ? buildSectionsFromText(sourceText) : []
        }, { preserveTextarea: true, silent: true });
    }

    function loadDocument(payload, options) {
        const settings = options || {};
        const rawText = payload && typeof payload.text === 'string' ? payload.text : '';
        const cleanedText = cleanDocumentText(rawText, !!(els.smartCleanup && els.smartCleanup.checked));
        const sections = normalizeSections(payload && payload.sections ? payload.sections : buildSectionsFromText(cleanedText));
        const meta = {
            title: payload && payload.title ? payload.title : 'Manual text',
            kind: payload && payload.kind ? payload.kind : 'manual',
            summary: payload && payload.summary ? payload.summary : buildSummary(cleanedText, sections),
            sections: sections
        };

        state.rawText = rawText;
        state.cleanedText = cleanedText;
        state.sections = sections;
        state.documentMeta = meta;
        state.words = flattenWords(sections);
        state.wordElements = [];
        state.activeWordIndex = -1;
        state.detectedLanguage = detectLanguage(cleanedText);

        if (els.inputText && !settings.preserveTextarea) {
            els.inputText.value = rawText;
        }

        renderDocumentSurface();
        updateAnalytics();
        updateDetectedLanguageUI();
        updateDocumentMeta();
        updateProgress(0);
        clearActiveWord();

        if (window.speechModule && typeof window.speechModule.handleDocumentUpdated === 'function') {
            window.speechModule.handleDocumentUpdated();
        }

        if (!settings.silent) {
            if (cleanedText.trim()) {
                window.showStatus('Document ready for narration', 'success');
            }
        }
    }

    function cleanDocumentText(text, enableCleanup) {
        if (!text) {
            return '';
        }

        let nextText = text.replace(/\r/g, '');
        if (!enableCleanup) {
            return nextText;
        }

        nextText = nextText
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/-\n(?=[a-z])/g, '')
            .replace(/([a-z])\n([a-z])/gi, '$1 $2')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

        return nextText.trim();
    }

    function buildSectionsFromText(text) {
        if (!text || !text.trim()) {
            return [];
        }

        return text
            .split(/\n{2,}/)
            .map(function(sectionText, index) {
                return {
                    label: 'Section ' + (index + 1),
                    kind: 'section',
                    text: sectionText.trim()
                };
            })
            .filter(function(section) {
                return section.text.length > 0;
            });
    }

    function normalizeSections(inputSections) {
        let runningIndex = 0;
        return (inputSections || []).map(function(section, index) {
            const text = section && typeof section.text === 'string' ? section.text.trim() : '';
            if (!text) {
                return null;
            }
            const tokens = text.match(/\S+/g) || [];
            const normalized = {
                id: 'section-' + index,
                label: section.label || section.title || ('Section ' + (index + 1)),
                kind: section.kind || 'section',
                text: text,
                startWordIndex: runningIndex,
                endWordIndex: runningIndex + tokens.length - 1,
                wordCount: tokens.length
            };
            runningIndex += tokens.length;
            return normalized;
        }).filter(Boolean);
    }

    function flattenWords(sections) {
        const words = [];
        sections.forEach(function(section, sectionIndex) {
            const tokens = section.text.match(/\S+/g) || [];
            tokens.forEach(function(token, tokenIndex) {
                words.push({
                    index: words.length,
                    sectionId: section.id,
                    sectionIndex: sectionIndex,
                    tokenIndex: tokenIndex,
                    text: token
                });
            });
        });
        return words;
    }

    function renderDocumentSurface() {
        if (!els.documentSurface) {
            return;
        }

        if (!state.sections.length) {
            renderEmptyState();
            return;
        }

        const sectionMarkup = state.sections.map(function(section) {
            return [
                '<section class="doc-section" data-section-id="', section.id, '">',
                '<header class="doc-section-header">',
                '<span class="doc-section-kind">', escapeHtml(section.kind), '</span>',
                '<h4>', escapeHtml(section.label), '</h4>',
                '<span class="doc-section-meta">', section.wordCount, ' words</span>',
                '</header>',
                '<div class="doc-section-body">', renderTextWithTokens(section.text, section.startWordIndex), '</div>',
                '</section>'
            ].join('');
        }).join('');

        els.documentSurface.innerHTML = '<div class="document-flow">' + sectionMarkup + '</div>';
        state.wordElements = Array.prototype.slice.call(els.documentSurface.querySelectorAll('.doc-word'));
        state.wordElements.forEach(function(element) {
            element.addEventListener('click', function() {
                const wordIndex = Number(element.dataset.wordIndex);
                if (window.speechModule && typeof window.speechModule.startReading === 'function') {
                    window.speechModule.startReading(wordIndex);
                }
            });
        });
    }

    function renderTextWithTokens(text, startWordIndex) {
        const tokens = text.match(/\S+|\s+/g) || [];
        let runningWordIndex = startWordIndex;

        return tokens.map(function(token) {
            if (/^\s+$/.test(token)) {
                return token
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/ /g, '&nbsp;')
                    .replace(/\n/g, '<br>');
            }

            const markup = '<button type="button" class="doc-word" data-word-index="' + runningWordIndex + '">' + escapeHtml(token) + '</button>';
            runningWordIndex += 1;
            return markup;
        }).join('');
    }

    function renderEmptyState() {
        if (!els.documentSurface) {
            return;
        }

        els.documentSurface.innerHTML = [
            '<div class="empty-state">',
            '<i class="fas fa-file-lines"></i>',
            '<h4>Import a file or paste content</h4>',
            '<p>LEXIO will render your pages, slides, or sections here and keep the highlights synced while speaking.</p>',
            '</div>'
        ].join('');
        state.wordElements = [];
    }

    function updateAnalytics() {
        const text = state.cleanedText;
        const wordCount = state.words.length;
        const charCount = text.length;
        const estimatedSeconds = Math.max(0, Math.round((wordCount / 165) * 60));

        if (els.charCounter) {
            els.charCounter.textContent = charCount + ' chars';
        }
        if (els.wordCountChip) {
            els.wordCountChip.textContent = wordCount + ' words';
        }
        if (els.wordCount) {
            els.wordCount.textContent = String(wordCount);
        }
        if (els.charCount) {
            els.charCount.textContent = String(charCount);
        }
        if (els.timeEstimate) {
            els.timeEstimate.textContent = formatDuration(estimatedSeconds);
        }
        if (els.sectionCount) {
            els.sectionCount.textContent = String(state.sections.length);
        }
        if (els.qualityHint) {
            els.qualityHint.textContent = buildQualityHint(wordCount, state.detectedLanguage, state.documentMeta.kind);
        }
    }

    function updateDetectedLanguageUI() {
        const preferred = getPreferredLanguage();
        if (els.detectedLanguage) {
            els.detectedLanguage.textContent = LANGUAGE_LABELS[preferred] || LANGUAGE_LABELS[state.detectedLanguage] || 'English';
        }
    }

    function updateDocumentMeta() {
        if (els.documentSummary) {
            els.documentSummary.textContent = state.documentMeta.summary;
        }
        if (els.activeDocumentType) {
            els.activeDocumentType.textContent = labelForKind(state.documentMeta.kind);
        }
        if (els.fileBadge) {
            els.fileBadge.textContent = state.documentMeta.title;
        }
    }

    function updateProgress(percent, label) {
        const normalized = Math.max(0, Math.min(100, Number(percent) || 0));
        if (els.progressBar) {
            els.progressBar.style.width = normalized.toFixed(1) + '%';
        }
        if (els.progressLabel) {
            els.progressLabel.textContent = Math.round(normalized) + '%';
        }
        if (els.playbackLabel && label) {
            els.playbackLabel.textContent = label;
        } else if (els.playbackLabel && normalized === 0 && (!window.lexioPlayback || !window.lexioPlayback.isReading)) {
            els.playbackLabel.textContent = 'Idle';
        }
    }

    function setActiveWord(index, options) {
        clearActiveWord();

        if (typeof index !== 'number' || index < 0 || !state.wordElements[index]) {
            return;
        }

        const target = state.wordElements[index];
        target.classList.add('active-word');
        state.activeWordIndex = index;

        const shouldScroll = !options || options.scroll !== false;
        if (shouldScroll) {
            const autoScrollEnabled = !document.getElementById('autoScrollHighlight') || document.getElementById('autoScrollHighlight').checked;
            if (autoScrollEnabled) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        }
    }

    function clearActiveWord() {
        if (state.activeWordIndex >= 0 && state.wordElements[state.activeWordIndex]) {
            state.wordElements[state.activeWordIndex].classList.remove('active-word');
        }
        state.activeWordIndex = -1;
    }

    function detectLanguage(text) {
        if (!text || !text.trim()) {
            return 'en';
        }

        const sample = text.slice(0, 2400);
        const scores = { en: 0, hi: 0, ar: 0, it: 0, es: 0 };

        const devanagari = sample.match(/[\u0900-\u097F]/g) || [];
        const arabic = sample.match(/[\u0600-\u06FF]/g) || [];
        scores.hi += devanagari.length * 3;
        scores.ar += arabic.length * 3;

        const lower = sample.toLowerCase();
        [' the ', ' and ', ' for ', ' with ', ' from '].forEach(function(token) {
            if (lower.indexOf(token) !== -1) { scores.en += 2; }
        });
        [' el ', ' la ', ' una ', ' para ', ' con '].forEach(function(token) {
            if (lower.indexOf(token) !== -1) { scores.es += 2; }
        });
        [' il ', ' lo ', ' una ', ' per ', ' con '].forEach(function(token) {
            if (lower.indexOf(token) !== -1) { scores.it += 2; }
        });

        if (/[áéíóúñ¿¡]/i.test(sample)) {
            scores.es += 4;
        }
        if (/[àèéìòù]/i.test(sample)) {
            scores.it += 4;
        }

        const winner = Object.keys(scores).sort(function(a, b) {
            return scores[b] - scores[a];
        })[0];

        return scores[winner] > 0 ? winner : 'en';
    }

    function getPreferredLanguage() {
        if (els.languageSelect && els.languageSelect.value && els.languageSelect.value !== 'auto') {
            return els.languageSelect.value;
        }
        return state.detectedLanguage || 'en';
    }

    function buildSummary(text, sections) {
        if (!text.trim()) {
            return 'Your document structure and live highlights appear here.';
        }
        if (sections.length === 1) {
            return 'One section ready for live narration and highlighting.';
        }
        return sections.length + ' sections prepared for synchronized reading.';
    }

    function buildQualityHint(wordCount, language, kind) {
        if (!wordCount) {
            return 'Paste text or upload a document to unlock voice matching and pacing suggestions.';
        }

        const parts = [
            'Detected ' + (LANGUAGE_LABELS[language] || 'English') + ' content',
            'optimized for ' + labelForKind(kind).toLowerCase()
        ];

        if (wordCount > 1200) {
            parts.push('long-form pacing recommended');
        } else if (wordCount > 300) {
            parts.push('balanced pacing recommended');
        } else {
            parts.push('short-form briefing mode');
        }

        return parts.join(', ') + '.';
    }

    function labelForKind(kind) {
        const map = {
            manual: 'Manual text',
            demo: 'Demo brief',
            txt: 'Text document',
            md: 'Markdown document',
            csv: 'Spreadsheet export',
            json: 'JSON document',
            rtf: 'Rich text document',
            pdf: 'PDF document',
            docx: 'Word document',
            doc: 'Legacy Word document',
            pptx: 'PowerPoint presentation',
            ppt: 'Legacy PowerPoint presentation'
        };
        return map[kind] || 'Imported document';
    }

    function formatDuration(totalSeconds) {
        if (!totalSeconds) {
            return '0s';
        }
        if (totalSeconds < 60) {
            return totalSeconds + 's';
        }
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes + 'm ' + seconds + 's';
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
})();
