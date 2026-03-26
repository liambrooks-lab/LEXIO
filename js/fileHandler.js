/**
 * LEXIO - File Import Pipeline
 */
(function() {
    const SUPPORTED_EXTENSIONS = ['txt', 'md', 'csv', 'json', 'rtf', 'html', 'htm', 'xml', 'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'odt', 'odp', 'epub'];
    const MAX_FILE_SIZE = 30 * 1024 * 1024;

    document.addEventListener('DOMContentLoaded', initFileHandler);

    function initFileHandler() {
        const uploadBtn = document.getElementById('uploadBtn');
        const dropZone = document.querySelector('.studio-card');
        const fileInput = ensureFileInput();

        if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', function() { fileInput.click(); });
        }

        fileInput.addEventListener('change', function(event) {
            const file = event.target.files && event.target.files[0];
            if (file) {
                handleFile(file);
            }
            event.target.value = '';
        });

        if (dropZone) {
            ['dragenter', 'dragover'].forEach(function(name) {
                dropZone.addEventListener(name, function(event) {
                    event.preventDefault();
                    dropZone.classList.add('drag-active');
                });
            });
            ['dragleave', 'drop'].forEach(function(name) {
                dropZone.addEventListener(name, function(event) {
                    event.preventDefault();
                    dropZone.classList.remove('drag-active');
                });
            });
            dropZone.addEventListener('drop', function(event) {
                const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
                if (file) {
                    handleFile(file);
                }
            });
        }
    }

    function ensureFileInput() {
        let input = document.getElementById('fileInput');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'fileInput';
            input.style.display = 'none';
            input.accept = SUPPORTED_EXTENSIONS.map(function(ext) { return '.' + ext; }).join(',');
            document.body.appendChild(input);
        }
        return input;
    }

    async function handleFile(file) {
        if (file.size > MAX_FILE_SIZE) {
            window.showStatus('File is too large. Maximum supported size is 30MB.', 'error');
            return;
        }

        const extension = getExtension(file.name);
        if (SUPPORTED_EXTENSIONS.indexOf(extension) === -1) {
            window.showStatus('Unsupported document type. Try PDF, DOCX, PPTX, XLSX, EPUB, TXT, HTML, XML, ODT, or ODP.', 'error');
            return;
        }

        window.showStatus('Importing ' + file.name + '...', 'info');

        try {
            const payload = await parseFile(file, extension);
            if (window.lexioApp && typeof window.lexioApp.loadDocument === 'function') {
                window.lexioApp.loadDocument(payload);
            }
            window.showStatus(file.name + ' is ready for narration.', 'success');
        } catch (error) {
            console.error(error);
            window.showStatus(error.message || 'Document import failed.', 'error');
        }
    }

    async function parseFile(file, extension) {
        if (['txt', 'md', 'csv', 'json'].indexOf(extension) !== -1) {
            const text = await file.text();
            return packageDocument(file.name, extension, text, buildTextSections(text), 'Imported structured text content into a normalized reading view.');
        }
        if (['html', 'htm', 'xml'].indexOf(extension) !== -1) {
            return readMarkup(file, extension);
        }
        if (extension === 'rtf') {
            const text = stripRtf(await file.text());
            return packageDocument(file.name, extension, text, buildTextSections(text), 'Rich text document converted into clean narration sections.');
        }
        if (extension === 'pdf') {
            return readPdf(file);
        }
        if (extension === 'docx') {
            return readDocx(file);
        }
        if (extension === 'pptx') {
            return readPptx(file);
        }
        if (extension === 'xlsx') {
            return readXlsx(file);
        }
        if (extension === 'odt' || extension === 'odp') {
            return readOpenDocument(file, extension);
        }
        if (extension === 'epub') {
            return readEpub(file);
        }
        if (extension === 'doc' || extension === 'ppt') {
            return readLegacyOfficeDocument(file, extension);
        }
        throw new Error('No parser is available for this document type yet.');
    }

    function packageDocument(title, kind, text, sections, summary) {
        return {
            title: title,
            kind: kind,
            text: text,
            sections: sections,
            summary: summary
        };
    }

    function buildTextSections(text) {
        return text.split(/\n{2,}/).map(function(block, index) {
            return {
                label: 'Section ' + (index + 1),
                kind: 'section',
                text: block.trim()
            };
        }).filter(function(section) {
            return section.text.length > 0;
        });
    }

    async function readMarkup(file, extension) {
        const source = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(source, extension === 'xml' ? 'application/xml' : 'text/html');
        const sections = [];
        const headings = doc.querySelectorAll('h1, h2, h3, title');
        if (headings.length) {
            headings.forEach(function(heading, index) {
                const label = heading.textContent.trim() || ('Section ' + (index + 1));
                const siblingText = heading.parentElement ? heading.parentElement.textContent : heading.textContent;
                const text = normalizeText(siblingText);
                if (text) {
                    sections.push({ label: label, kind: extension === 'xml' ? 'node' : 'section', text: text });
                }
            });
        }
        const fallbackText = normalizeText(doc.body ? doc.body.textContent : doc.documentElement.textContent);
        return packageDocument(file.name, extension, fallbackText, sections.length ? sections : buildTextSections(fallbackText), 'Markup content converted into readable sections.');
    }

    async function readPdf(file) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF support is unavailable because PDF.js failed to load.');
        }
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const sections = [];
        const textParts = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            const pageText = normalizeText(content.items.map(function(item) { return item.str; }).join(' '));
            if (pageText) {
                sections.push({ label: 'Page ' + pageNumber, kind: 'page', text: pageText });
                textParts.push(pageText);
            }
        }

        return packageDocument(file.name, 'pdf', textParts.join('\n\n'), sections, pdf.numPages + ' PDF pages converted into a synchronized reading view.');
    }

    async function readDocx(file) {
        if (typeof mammoth === 'undefined') {
            throw new Error('DOCX support is unavailable because Mammoth failed to load.');
        }
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        const text = normalizeText(result.value || '');
        return packageDocument(file.name, 'docx', text, buildTextSections(text), 'Word document converted into clean paragraphs for AI narration.');
    }

    async function readPptx(file) {
        ensureZipSupport();
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const slidePaths = Object.keys(zip.files).filter(function(path) {
            return /^ppt\/slides\/slide\d+\.xml$/.test(path);
        }).sort(sortByNumber);

        const sections = [];
        const textParts = [];
        for (let index = 0; index < slidePaths.length; index += 1) {
            const xml = await zip.file(slidePaths[index]).async('string');
            const slideText = extractXmlText(xml, 'a:t');
            if (slideText) {
                sections.push({ label: 'Slide ' + (index + 1), kind: 'slide', text: slideText });
                textParts.push(slideText);
            }
        }
        return packageDocument(file.name, 'pptx', textParts.join('\n\n'), sections, slidePaths.length + ' presentation slides prepared for guided narration.');
    }

    async function readXlsx(file) {
        if (typeof XLSX === 'undefined') {
            throw new Error('Spreadsheet support is unavailable because SheetJS failed to load.');
        }
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const sections = [];
        const textParts = [];
        workbook.SheetNames.forEach(function(sheetName) {
            const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            const text = normalizeText(csv.replace(/,/g, ' | '));
            if (text) {
                sections.push({ label: sheetName, kind: 'sheet', text: text });
                textParts.push(text);
            }
        });
        return packageDocument(file.name, 'xlsx', textParts.join('\n\n'), sections, workbook.SheetNames.length + ' worksheet tabs normalized for reading.');
    }

    async function readOpenDocument(file, extension) {
        ensureZipSupport();
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const xml = await zip.file('content.xml').async('string');
        const text = extractXmlText(xml, 'text:p');
        const sections = buildTextSections(text);
        const kind = extension === 'odt' ? 'odt' : 'odp';
        return packageDocument(file.name, kind, text, sections, 'OpenDocument file converted into narration-ready sections.');
    }

    async function readEpub(file) {
        ensureZipSupport();
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const chapterPaths = Object.keys(zip.files).filter(function(path) {
            return /\.(xhtml|html|htm)$/i.test(path) && path.indexOf('nav') === -1 && path.indexOf('toc') === -1;
        }).sort();

        const sections = [];
        const textParts = [];
        for (let index = 0; index < chapterPaths.length; index += 1) {
            const source = await zip.file(chapterPaths[index]).async('string');
            const parser = new DOMParser();
            const doc = parser.parseFromString(source, 'text/html');
            const title = normalizeText((doc.querySelector('title,h1,h2') || {}).textContent || ('Chapter ' + (index + 1)));
            const text = normalizeText(doc.body ? doc.body.textContent : doc.documentElement.textContent);
            if (text) {
                sections.push({ label: title || ('Chapter ' + (index + 1)), kind: 'chapter', text: text });
                textParts.push(text);
            }
        }
        return packageDocument(file.name, 'epub', textParts.join('\n\n'), sections, chapterPaths.length + ' EPUB chapters converted into synchronized reading sections.');
    }

    async function readLegacyOfficeDocument(file, extension) {
        const decoder = new TextDecoder('latin1');
        const rawText = normalizeText(decoder.decode(await file.arrayBuffer()).replace(/\u0000/g, ' '));
        if (!rawText || rawText.length < 40) {
            throw new Error('Legacy .' + extension + ' files are difficult to recover accurately in-browser. Save them as DOCX or PPTX for the best experience.');
        }
        return packageDocument(file.name, extension, rawText, buildTextSections(rawText), 'Legacy office file imported with best-effort text recovery.');
    }

    function stripRtf(source) {
        return normalizeText(source.replace(/\\par[d]?/g, '\n').replace(/\\'[0-9a-fA-F]{2}/g, ' ').replace(/\\[a-z]+-?\d* ?/g, '').replace(/[{}]/g, ' '));
    }

    function extractXmlText(xml, tagName) {
        const safeTag = tagName.replace(':', '\\:');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const nodes = doc.getElementsByTagName(tagName).length ? doc.getElementsByTagName(tagName) : doc.querySelectorAll(safeTag);
        const text = Array.prototype.slice.call(nodes).map(function(node) { return node.textContent || ''; }).join(' ');
        return normalizeText(text);
    }

    function normalizeText(text) {
        return String(text || '').replace(/\s{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    }

    function ensureZipSupport() {
        if (typeof JSZip === 'undefined') {
            throw new Error('This document type requires JSZip, but the library did not load.');
        }
    }

    function sortByNumber(a, b) {
        const aNum = Number((a.match(/(\d+)/) || [0, 0])[1]);
        const bNum = Number((b.match(/(\d+)/) || [0, 0])[1]);
        return aNum - bNum;
    }

    function getExtension(fileName) {
        const parts = fileName.toLowerCase().split('.');
        return parts.length > 1 ? parts.pop() : '';
    }
})();
