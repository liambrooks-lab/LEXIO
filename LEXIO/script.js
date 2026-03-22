document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const confirmBtn = document.getElementById('confirmBtn');
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    const greetingText = document.getElementById('greetingText');
    
    // Inputs
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmailInput');

    // 2. The Concept Logic: Form -> TTS Window
    confirmBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (name && email) {
            // Store user info (as per your original concept)
            localStorage.setItem('lexio_user_name', name);
            
            // Switch Windows
            loginPage.style.display = 'none';
            mainApp.style.display = 'block';

            // Personalized Greeting
            greetingText.textContent = `Hi, ${name}!`;
            
            if (typeof window.showStatus === 'function') {
                window.showStatus(`Welcome ${name}`, 'success');
            }
        } else {
            alert("Please fill in your details to continue.");
        }
    });

    // 3. TTS Highlighting Logic (Fixed to prevent the 'index' crash)
    const inputText = document.getElementById('inputText');
    const displayText = document.getElementById('displayText');

    inputText.addEventListener('input', () => {
        const text = inputText.value;
        // Restored your word-wrapping concept but used safe backticks
        displayText.innerHTML = text.split(/\s+/).map((word, index) => {
            return `<span class="word" data-index="${index}">${word}</span>`;
        }).join(' ');
    });

    // Check for existing session
    const savedName = localStorage.getItem('lexio_user_name');
    if (savedName) {
        loginPage.style.display = 'none';
        mainApp.style.display = 'block';
        greetingText.textContent = `Hi, ${savedName}!`;
    }
});