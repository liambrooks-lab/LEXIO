/**
 * LEXIO - AI Assist Layer
 */
(function() {
    const STOPWORDS = {
        en: ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'into', 'about', 'there', 'which', 'when', 'while', 'have', 'will', 'should', 'could', 'would'],
        es: ['para', 'con', 'como', 'esta', 'este', 'desde', 'sobre', 'entre', 'porque', 'cuando', 'donde'],
        it: ['come', 'questa', 'questo', 'della', 'delle', 'degli', 'anche', 'prima', 'dopo', 'mentre'],
        hi: ['और', 'यह', 'है', 'के', 'को', 'से', 'में', 'पर', 'एक', 'लिए'],
        ar: ['هذا', 'هذه', 'ذلك', 'على', 'الى', 'من', 'في', 'مع', 'عن', 'التي']
    };

    const MODE_PRESETS = {
        adaptive: { speed: 1, pitch: 1, message: 'Adaptive mode balances clarity and pace.' },
        executive: { speed: 1.05, pitch: 0.95, message: 'Executive mode prioritizes concise, steady narration.' },
        study: { speed: 0.92, pitch: 1.02, message: 'Study mode slows down slightly for retention.' },
        presentation: { speed: 1, pitch: 1.08, message: 'Presentation mode keeps delivery lively and stage-ready.' },
        accessibility: { speed: 0.85, pitch: 1, message: 'Accessibility mode maximizes clarity and followability.' }
    };

    const els = {};
    let lastSignature = '';

    document.addEventListener('DOMContentLoaded', function() {
        cacheElements();
        bindActions();
        waitForApp();
    });

    function cacheElements() {
        [
            'aiSummary', 'aiTopics', 'aiGlossary', 'aiActions', 'outlinePanel', 'aiResponse',
            'briefModeBtn', 'studyModeBtn', 'presentationModeBtn', 'qaModeBtn', 'readingModeSelect',
            'speedRange', 'speedValue', 'pitchRange', 'pitchValue', 'aiConfidence'
        ].forEach(function(id) {
            els[id] = document.getElementById(id);
        });
    }

    function bindActions() {
        if (els.readingModeSelect) {
            els.readingModeSelect.addEventListener('change', function(event) {
                applyMode(event.target.value, true);
            });
        }
        if (els.briefModeBtn) {
            els.briefModeBtn.addEventListener('click', function() {
                applyMode('executive', true);
                renderResponseBlock('Executive brief', buildInsights().summary);
            });
        }
        if (els.studyModeBtn) {
            els.studyModeBtn.addEventListener('click', function() {
                applyMode('study', true);
                renderResponseBlock('Study notes', buildInsights().studyNotes);
            });
        }
        if (els.presentationModeBtn) {
            els.presentationModeBtn.addEventListener('click', function() {
                applyMode('presentation', true);
                renderResponseBlock('Presentation flow', buildInsights().presentationFlow);
            });
        }
        if (els.qaModeBtn) {
            els.qaModeBtn.addEventListener('click', function() {
                renderResponseBlock('Review prompts', buildInsights().questions);
            });
        }
    }

    function waitForApp() {
        const timer = window.setInterval(function() {
            if (!window.lexioApp || !window.lexioApp.getState) {
                return;
            }
            window.clearInterval(timer);
            window.lexioAI = { refresh: refresh, applyMode: applyMode };
            applyMode(els.readingModeSelect && els.readingModeSelect.value ? els.readingModeSelect.value : 'adaptive', false);
            refresh();
            window.setInterval(refresh, 500);
        }, 120);
    }

    function refresh() {
        const app = window.lexioApp;
        if (!app || !app.getState) {
            return;
        }

        const state = app.getState();
        const signature = [state.cleanedText, state.detectedLanguage, state.sections.length].join('|');
        if (signature === lastSignature) {
            return;
        }
        lastSignature = signature;

        const insights = buildInsights();
        renderList(els.aiSummary, insights.summary, 'Summary appears when your document is ready.');
        renderTags(els.aiTopics, insights.topics, 'Key topics will appear here.');
        renderList(els.aiGlossary, insights.glossary, 'Entities and terminology will appear here.');
        renderList(els.aiActions, insights.actions, 'Important action lines and recommendations will appear here.');
        renderOutline(state.sections || []);
        if (els.aiConfidence) {
            els.aiConfidence.textContent = insights.confidence;
        }
        if (!state.cleanedText.trim()) {
            if (els.aiResponse) {
                els.aiResponse.innerHTML = '<p>Ask the command center to generate a brief, study pack, presentation flow, or review prompts from your current document.</p>';
            }
            return;
        }
        renderResponseBlock('Executive brief', insights.summary);
    }

    function buildInsights() {
        const app = window.lexioApp;
        const state = app.getState();
        const text = state.cleanedText || '';
        const language = app.getPreferredLanguage ? app.getPreferredLanguage() : state.detectedLanguage || 'en';
        const sections = state.sections || [];
        const sentences = splitSentences(text);
        const summary = summarize(sentences, text, language);
        const topics = extractTopics(text, language);
        const glossary = extractGlossary(text);
        const actions = extractActions(sentences);
        const questions = buildQuestions(topics, summary);
        const presentationFlow = buildPresentationFlow(sections, summary);
        const studyNotes = buildStudyNotes(summary, topics, actions);

        return {
            summary: summary,
            topics: topics,
            glossary: glossary,
            actions: actions,
            questions: questions,
            presentationFlow: presentationFlow,
            studyNotes: studyNotes,
            confidence: buildConfidence(text, sections, topics)
        };
    }

    function splitSentences(text) {
        if (!text.trim()) {
            return [];
        }
        return text.replace(/\n+/g, ' ').split(/(?<=[.!?؟।])\s+/).map(function(item) {
            return item.trim();
        }).filter(Boolean);
    }

    function summarize(sentences, text, language) {
        if (!sentences.length) {
            return [];
        }
        const frequency = buildFrequency(text, language);
        return sentences.map(function(sentence, index) {
            const words = sentence.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || [];
            const score = words.reduce(function(total, word) {
                return total + (frequency[word] || 0);
            }, 0) / Math.max(words.length, 1);
            return { sentence: sentence, score: score, index: index };
        }).sort(function(a, b) {
            return b.score - a.score;
        }).slice(0, Math.min(3, sentences.length)).sort(function(a, b) {
            return a.index - b.index;
        }).map(function(item) {
            return item.sentence;
        });
    }

    function buildFrequency(text, language) {
        const stopwords = STOPWORDS[language] || STOPWORDS.en;
        const map = {};
        (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || []).forEach(function(word) {
            if (word.length < 3 || stopwords.indexOf(word) !== -1) {
                return;
            }
            map[word] = (map[word] || 0) + 1;
        });
        return map;
    }

    function extractTopics(text, language) {
        const stopwords = STOPWORDS[language] || STOPWORDS.en;
        const counts = {};
        (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || []).forEach(function(word) {
            if (word.length < 3 || stopwords.indexOf(word) !== -1) {
                return;
            }
            counts[word] = (counts[word] || 0) + 1;
        });
        return Object.keys(counts).sort(function(a, b) {
            return counts[b] - counts[a];
        }).slice(0, 10).map(function(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        });
    }

    function extractGlossary(text) {
        const picks = [];
        const tokens = (text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) || []).concat(text.match(/\b[A-Z]{2,}\b/g) || []);
        tokens.forEach(function(token) {
            if (picks.indexOf(token) === -1) {
                picks.push(token);
            }
        });
        return picks.slice(0, 8).map(function(token) {
            return token + ' - notable term or entity';
        });
    }

    function extractActions(sentences) {
        const actionWords = ['must', 'should', 'need', 'review', 'prepare', 'confirm', 'finalize', 'action'];
        const hits = sentences.filter(function(sentence) {
            const lower = sentence.toLowerCase();
            return actionWords.some(function(word) { return lower.indexOf(word) !== -1; });
        });
        return (hits.length ? hits : sentences.slice(0, 4)).slice(0, 5);
    }

    function buildQuestions(topics, summary) {
        const questions = topics.slice(0, 4).map(function(topic) {
            return 'How does "' + topic + '" affect the core message of the document?';
        });
        if (summary.length) {
            questions.push('Which single takeaway should the audience remember first?');
        }
        return questions.slice(0, 5);
    }

    function buildPresentationFlow(sections, summary) {
        const items = [];
        if (summary[0]) {
            items.push('Open with: ' + summary[0]);
        }
        sections.slice(0, 4).forEach(function(section) {
            items.push('Cover ' + section.label + ' and emphasize ' + snippet(section.text));
        });
        if (summary.length > 1) {
            items.push('Close with: ' + summary[summary.length - 1]);
        }
        return items.slice(0, 6);
    }

    function buildStudyNotes(summary, topics, actions) {
        const items = summary.map(function(item) { return 'Remember: ' + item; });
        if (topics.length) {
            items.push('Focus topics: ' + topics.slice(0, 4).join(', '));
        }
        if (actions.length) {
            items.push('Priority cue: ' + actions[0]);
        }
        return items.slice(0, 5);
    }

    function buildConfidence(text, sections, topics) {
        if (!text.trim()) {
            return 'Standby';
        }
        if (sections.length >= 5 || topics.length >= 6) {
            return 'High';
        }
        if (sections.length >= 2 || topics.length >= 3) {
            return 'Medium';
        }
        return 'Focused';
    }

    function renderOutline(sections) {
        if (!els.outlinePanel) {
            return;
        }
        if (!sections.length) {
            els.outlinePanel.innerHTML = 'The outline becomes interactive once the document is parsed.';
            els.outlinePanel.classList.add('empty-copy');
            return;
        }
        els.outlinePanel.classList.remove('empty-copy');
        els.outlinePanel.innerHTML = sections.map(function(section) {
            return '<button type="button" class="outline-item" data-section-id="' + section.id + '"><span class="outline-label">' + escapeHtml(section.label) + '</span><span class="outline-meta">' + section.wordCount + ' words</span></button>';
        }).join('');
        Array.prototype.slice.call(els.outlinePanel.querySelectorAll('.outline-item')).forEach(function(button) {
            button.addEventListener('click', function() {
                const section = document.querySelector('[data-section-id="' + button.dataset.sectionId + '"]');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    function applyMode(mode, announce) {
        const preset = MODE_PRESETS[mode] || MODE_PRESETS.adaptive;
        if (els.readingModeSelect) {
            els.readingModeSelect.value = mode in MODE_PRESETS ? mode : 'adaptive';
        }
        if (els.speedRange && els.speedValue) {
            els.speedRange.value = String(preset.speed);
            els.speedValue.textContent = Number(preset.speed).toFixed(2) + 'x';
        }
        if (els.pitchRange && els.pitchValue) {
            els.pitchRange.value = String(preset.pitch);
            els.pitchValue.textContent = Number(preset.pitch).toFixed(1);
        }
        if (announce && typeof window.showStatus === 'function') {
            window.showStatus(preset.message, 'info');
        }
    }

    function renderList(element, items, emptyMessage) {
        if (!element) {
            return;
        }
        if (!items.length) {
            element.innerHTML = emptyMessage;
            element.classList.add('empty-copy');
            return;
        }
        element.classList.remove('empty-copy');
        element.innerHTML = '<ul>' + items.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
    }

    function renderTags(element, items, emptyMessage) {
        if (!element) {
            return;
        }
        if (!items.length) {
            element.innerHTML = emptyMessage;
            element.classList.add('empty-copy');
            return;
        }
        element.classList.remove('empty-copy');
        element.innerHTML = items.map(function(item) { return '<span class="topic-tag">' + escapeHtml(item) + '</span>'; }).join('');
    }

    function renderResponseBlock(title, items) {
        if (!els.aiResponse) {
            return;
        }
        if (!items.length) {
            els.aiResponse.innerHTML = '<p>No AI output is available yet for this document.</p>';
            return;
        }
        els.aiResponse.innerHTML = '<div class="response-block"><h4>' + escapeHtml(title) + '</h4><ul>' + items.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul></div>';
    }

    function snippet(text) {
        const cleaned = text.replace(/\s+/g, ' ').trim();
        return cleaned.length > 88 ? cleaned.slice(0, 85) + '...' : cleaned;
    }

    function escapeHtml(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();
