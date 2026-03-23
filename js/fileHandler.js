/**
 * LEXIO - File Handler Module
 */

document.addEventListener('DOMContentLoaded', function() {
    initFileHandler();
});

function initFileHandler() {
    const uploadBtn = document.getElementById('uploadBtn');
    const dropZone = document.querySelector('.input-section'); // Bind drop to the whole card
    const inputText = document.getElementById('inputText');
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const SUPPORTED_TYPES = { 'txt': 'text/plain', 'pdf': 'application/pdf' };

    // Dynamically create the hidden file input if it doesn't exist
    let fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.style.display = 'none';
        fileInput.accept = '.txt,.pdf';
        document.body.appendChild(fileInput);
    }

    // Button click triggers file input
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileInput.click());
    }

    // Drag and Drop Logic
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.border = '2px dashed var(--primary)';
            dropZone.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.border = '';
            dropZone.style.backgroundColor = '';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.border = '';
            dropZone.style.backgroundColor = '';
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        });
    }

    // Input Change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
        e.target.value = ''; // Reset so same file can be uploaded again
    });

    async function handleFile(file) {
        if (file.size > MAX_FILE_SIZE) {
            return window.showStatus('File too large. Maximum size is 10MB', 'error');
        }
        
        const extension = file.name.split('.').pop().toLowerCase();
        if (!SUPPORTED_TYPES[extension]) {
            return window.showStatus('Unsupported file type. Please upload TXT or PDF', 'error');
        }
        
        window.showStatus(`Processing ${file.name}...`, 'info');
        
        try {
            let text = '';
            if (extension === 'txt') {
                text = await readTxtFile(file);
            } else if (extension === 'pdf') {
                text = await readPdfFile(file);
            }
            
            if (inputText) {
                inputText.value = text;
                inputText.dispatchEvent(new Event('input', { bubbles: true }));
                window.showStatus('File loaded successfully!', 'success');
            }
        } catch (error) {
            console.error('File error:', error);
            window.showStatus('Error reading file', 'error');
        }
    }

    function readTxtFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read text file'));
            reader.readAsText(file);
        });
    }

    async function readPdfFile(file) {
        if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js library not loaded');
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n\n';
            }
            return text;
        } catch (error) {
            throw new Error('Failed to parse PDF content');
        }
    }
}