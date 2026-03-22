/**
 * LEXIO - File Handler Module
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initFileHandler();
});

function initFileHandler() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadArea = document.getElementById('uploadArea');

    // Maximum file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Supported file types
    const SUPPORTED_TYPES = {
        'txt': 'text/plain',
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'epub': 'application/epub+zip'
    };

    // Safe showStatus function
    function showSafeStatus(message, type = 'info') {
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, type);
        } else {
            console.log(`[${type}] ${message}`);
            // Try to find status element
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.style.display = 'block';
                const colors = {
                    success: '#10B981',
                    error: '#EF4444',
                    warning: '#F59E0B',
                    info: '#3B82F6'
                };
                statusEl.style.background = colors[type] + '20';
                statusEl.style.color = colors[type];
                statusEl.style.border = `1px solid ${colors[type]}40`;
                
                setTimeout(() => {
                    if (statusEl) statusEl.style.display = 'none';
                }, 3000);
            }
        }
    }

    // Safe formatFileSize function
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Safe addActivity function
    function addSafeActivity(message) {
        if (typeof window.addActivity === 'function') {
            window.addActivity(message);
        } else {
            console.log('Activity:', message);
        }
    }

    // Check if elements exist before adding listeners
    if (!uploadArea || !fileInput || !fileInfo) {
        console.warn('File handler elements not found');
        return;
    }

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    /**
     * Handle uploaded file
     * @param {File} file - Uploaded file
     */
    async function handleFile(file) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            showSafeStatus('File too large. Maximum size is 10MB', 'error');
            if (fileInfo) fileInfo.textContent = 'File too large';
            return;
        }
        
        // Get file extension
        const extension = file.name.split('.').pop().toLowerCase();
        
        // Check if supported
        if (!SUPPORTED_TYPES[extension]) {
            showSafeStatus('Unsupported file type. Please upload TXT or PDF', 'error');
            if (fileInfo) fileInfo.textContent = 'Unsupported type';
            return;
        }
        
        // Show file info
        if (fileInfo) {
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
        }
        showSafeStatus('Processing file...', 'info');
        
        try {
            let text = '';
            
            // Handle different file types
            switch (extension) {
                case 'txt':
                    text = await readTxtFile(file);
                    break;
                case 'pdf':
                    text = await readPdfFile(file);
                    break;
                case 'docx':
                    showSafeStatus('DOCX support coming soon!', 'info');
                    return;
                case 'epub':
                    showSafeStatus('EPUB support coming soon!', 'info');
                    return;
                default:
                    throw new Error('Unsupported file type');
            }
            
            // Update textarea
            const inputText = document.getElementById('inputText');
            if (inputText) {
                inputText.value = text;
                // Trigger input event to update counters
                const event = new Event('input', { bubbles: true });
                inputText.dispatchEvent(event);
            }
            
            showSafeStatus('File loaded successfully!', 'success');
            addSafeActivity(`Loaded file: ${file.name}`);
            
        } catch (error) {
            console.error('File processing error:', error);
            showSafeStatus('Error processing file: ' + error.message, 'error');
            if (fileInfo) fileInfo.textContent = 'Error loading file';
        }
    }

    /**
     * Read text file
     * @param {File} file - Text file
     * @returns {Promise<string>} File contents
     */
    function readTxtFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read text file'));
            reader.readAsText(file);
        });
    }

    /**
     * Read PDF file using PDF.js
     * @param {File} file - PDF file
     * @returns {Promise<string>} Extracted text
     */
    async function readPdfFile(file) {
        // Check if pdfjsLib is available
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded');
        }
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let text = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                text += pageText + '\n\n';
            }
            
            return text;
        } catch (error) {
            throw new Error('Failed to read PDF: ' + error.message);
        }
    }

    console.log('✅ File Handler module loaded');
}