# 🎤 LEXIO - Enterprise Text-to-Speech Studio

![Version](https://img.shields.io/badge/version-1.0.0-8B5CF6)
![License](https://img.shields.io/badge/license-MIT-10B981)
![Platform](https://img.shields.io/badge/platform-web-3B82F6)
![Status](https://img.shields.io/badge/status-stable-10B981)

🌍 **Choose your language / अपनी भाषा चुनें:**
* [🇬🇧 Read in English (Default)](#english-documentation)
* [🇮🇳 हिंदी में पढ़ें (Read in Hindi)](#hindi-documentation)

---

<a id="english-documentation"></a>
## 🇬🇧 English Documentation

> Transform text into natural speech with enterprise-grade controls and real-time word highlighting. Built for accessibility, education, and professional content creation.

---

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Real-time Word Highlighting** | Watch words light up as they're spoken |
| 🎮 **Full Playback Control** | Play, Pause, Resume, Stop with intuitive controls |
| ⚡ **Adjustable Speed** | Customize reading pace from 0.5x to 3x |
| 🎤 **Voice Selection** | Choose from multiple male and female voices |
| 📁 **File Upload** | Support for TXT and PDF documents (drag & drop) |
| 👆 **Click-to-Read** | Click any word to start reading from that position |
| 📱 **Responsive Design** | Seamless experience across desktop, tablet, and mobile |
| 🔐 **Secure Authentication** | Simple login with name, email, and phone validation |
| 📊 **Real-time Analytics** | Word count, character count, and estimated reading time |
| 📋 **Activity Log** | Track all your actions in real-time |

---

### 🚀 Live Demo

**[Launch LEXIO Studio →](https://liambrooks-lab.github.io/LEXIO/)**

---

### 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure and markup |
| **CSS3** | Modern styling with glass morphism and responsive grid |
| **JavaScript (ES6+)** | Core functionality and speech synthesis |
| **Web Speech API** | Text-to-speech conversion |
| **PDF.js** | PDF text extraction and parsing |
| **Google Fonts** | Inter font family for clean typography |

---

### 📁 Project Structure

```text
LEXIO/
├── index.html # Main entry point
├── styles.css # Core styles and layout
├── script.js # Main application logic
├── assets/ # Static assets
│ ├── favicon.ico # Browser tab icon
│ ├── logo.svg # Application logo
│ ├── fonts/ # Custom fonts (optional)
│ └── icons/ # UI icons (optional)
├── css/ # Additional styles
│ └── components.css # Reusable component styles
├── js/ # JavaScript modules
│ ├── auth.js # Authentication logic
│ ├── speech.js # Speech synthesis engine
│ ├── fileHandler.js # File upload and processing
│ └── utils.js # Utility functions
├── docs/ # Documentation
│ ├── API.md # API reference
│ ├── CONTRIBUTING.md # Contribution guidelines
│ └── CHANGELOG.md # Version history
└── .github/ # GitHub configuration
├── workflows/ # GitHub Actions
│ └── deploy.yml # Auto-deployment workflow
├── FUNDING.yml # Sponsor configuration
└── PULL_REQUEST_TEMPLATE.md