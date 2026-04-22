#  LEXIO

![Version](https://img.shields.io/badge/version-1.0.0-8B5CF6)
![License](https://img.shields.io/badge/license-MIT-10B981)
![Platform](https://img.shields.io/badge/platform-web-3B82F6)
![Status](https://img.shields.io/badge/status-stable-10B981)

> Transform text into natural speech with enterprise-grade controls and real-time word highlighting. Built for accessibility, education, and professional content creation.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
|  **Real-time Word Highlighting** | Watch words light up as they're spoken |
|  **Full Playback Control** | Play, Pause, Resume, Stop with intuitive controls |
|  **Adjustable Speed** | Customize reading pace from 0.5x to 3x |
|  **Voice Selection** | Choose from multiple male and female voices |
|  **File Upload** | Support for TXT and PDF documents (drag & drop) |
|  **Click-to-Read** | Click any word to start reading from that position |
|  **Responsive Design** | Seamless experience across desktop, tablet, and mobile |
|  **Secure Authentication** | Simple login with name, email, and phone validation |
|  **Real-time Analytics** | Word count, character count, and estimated reading time |
|  **Activity Log** | Track all your actions in real-time |

---

## 🖼️ Demo Gallery

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/readme/lexio-login.png" alt="LEXIO login experience" />
      <br />
      <strong>1. Workspace entry and identity setup</strong>
      <br />
      LEXIO opens with a branded login experience where users can add a display photo and enter the narration workspace with a clear product-first presentation.
    </td>
    <td width="50%" valign="top">
      <img src="docs/readme/lexio-dashboard.png" alt="LEXIO dashboard view" />
      <br />
      <strong>2. Dashboard and AI reading assist</strong>
      <br />
      The dashboard shows AI reading assistance, document stats, command-center actions, and the high-level outputs users need before starting playback.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/readme/lexio-reader.png" alt="LEXIO reader view" />
      <br />
      <strong>3. Reader and voice lab</strong>
      <br />
      The reader workspace combines source editing, live document viewing, import actions, playback controls, and voice tuning across language, accent, and persona.
    </td>
    <td width="50%" valign="top">
      <img src="docs/readme/lexio-ai-studio.png" alt="LEXIO AI studio view" />
      <br />
      <strong>4. AI Studio and document inspection</strong>
      <br />
      AI Studio focuses on glossary extraction, structure outline, review prompts, and supported import scope so users can inspect documents beyond playback alone.
    </td>
  </tr>
</table>

---

## ❤️ Why LEXIO

LEXIO is built around a simple promise:

- bring in a real document
- make it readable and listenable
- keep the visual structure visible while speaking
- help the user understand the content faster

That promise drives the product design, feature set, and workspace layout across the entire project.

---

## 🌍 Language And Format Support

### Narration languages

- English
- Hindi
- Arabic
- Italian
- Spanish

### Supported document formats

- PDF
- DOCX
- DOC
- PPTX
- PPT
- XLSX
- EPUB
- TXT
- Markdown
- CSV
- JSON
- RTF
- HTML
- HTM
- XML
- ODT
- ODP

### Notes on voice availability

LEXIO uses the browser's `SpeechSynthesis` engine, so the exact voices available depend on the operating system and browser voice packs installed on the device.

---

## 🛠️ Tech Stack

### Core frontend

- HTML5
- CSS3
- JavaScript (ES6+)

### Browser and speech layer

- Web Speech API
- DOMParser
- Local Storage

### Document parsing libraries

- PDF.js
- Mammoth.js
- JSZip
- SheetJS (`xlsx`)

### UI and assets

- Font Awesome
- Google Fonts

---

## 📁 Project Structure

LEXIO/
├── index.html                # Main entry point
├── styles.css               # Core styles and layout
├── script.js                # Main application logic
├── assets/                  # Static assets
│   ├── favicon.ico          # Browser tab icon
│   ├── logo.svg             # Application logo
│   ├── fonts/               # Custom fonts (optional)
│   └── icons/               # UI icons (optional)
├── css/                     # Additional styles
│   └── components.css       # Reusable component styles
├── js/                      # JavaScript modules
│   ├── auth.js              # Authentication logic
│   ├── speech.js            # Speech synthesis engine
│   ├── fileHandler.js       # File upload and processing
│   └── utils.js             # Utility functions
├── docs/                    # Documentation
│   ├── API.md               # API reference
│   ├── CONTRIBUTING.md      # Contribution guidelines
│   └── CHANGELOG.md         # Version history
└── .github/                 # GitHub configuration
    ├── workflows/           # GitHub Actions
    │   └── deploy.yml       # Auto-deployment workflow
    ├── FUNDING.yml          # Sponsor configuration
    └── PULL_REQUEST_TEMPLATE.md


---

## ⚙️ Local Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local server (optional, recommended for PDF support)

### Installation

# Clone the repository
git clone https://github.com/liambrooks-lab/LEXIO.git

# Navigate to project directory
cd LEXIO

# Open in browser
open index.html

## Development
# Using VS Code Live Server
1. Install Live Server extension
2. Right-click index.html
3. Select "Open with Live Server"
4. Visit http://localhost:5500

## 📊 Performance Metrics

| Metric | Value |
| :--- | :--- |
| **First Contentful Paint** | < 1.5s |
| **Time to Interactive** | < 3s |
| **Lighthouse Score** | 95+ |
| **Bundle Size** | < 500KB |
| **Browser Support** | Chrome 33+, Firefox 49+, Safari 7+, Edge 14+ |

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

### Development Process
1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<p align="center">
  <img src="docs/readme/author-rudranarayan-jena.jpg" alt="Rudranarayan Jena" width="180" />
</p>

<p align="center">
  <strong>Crafted by MR. Rudranarayan Jena</strong>
</p>

<p align="center">
  Product Builder • Front-end Developer • AI Enthusiast • Creator of LEXIO
</p>

<p align="center">
  Focused on building polished browser products, practical AI-assisted experiences, and interfaces that feel like real software instead of rough demos.
</p>

<p align="center">
  <a href="https://github.com/liambrooks-lab">GitHub: @liambrooks-lab</a>
  |
  <a href="https://github.com/liambrooks-lab/LEXIO">Project Repository</a>
</p>

---

## 🙌 Acknowledgments

- **Web Speech API** for browser-native narration support
- **PDF.js** for PDF extraction in the browser
- **Mammoth.js** for DOCX text extraction
- **JSZip** and **SheetJS** for document parsing support
- everyone who tests, reviews, and helps improve the product

---

## 📬 Support

- **Issues**: [Report a bug](https://github.com/liambrooks-lab/LEXIO/issues)
- **Repository**: [https://github.com/liambrooks-lab/LEXIO](https://github.com/liambrooks-lab/LEXIO)

---

## ⭐ Show Your Support

If you like LEXIO, consider giving the project a **star** on GitHub.
