<p align="center">
  <img src="assets/logo.svg" alt="LEXIO logo" width="160" />
</p>

<h1 align="center">LEXIO</h1>

<p align="center">
  AI-assisted speech, document intelligence, and multilingual reading control.
</p>

<p align="center">
  <a href="https://liambrooks-lab.github.io/LEXIO/">Live Demo</a>
  |
  <a href="https://github.com/liambrooks-lab/LEXIO">Repository</a>
  |
  <a href="docs/CONTRIBUTING.md">Contributing</a>
  |
  <a href="LICENSE">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-2563EB" alt="Version badge" />
  <img src="https://img.shields.io/badge/platform-web-0F172A" alt="Platform badge" />
  <img src="https://img.shields.io/badge/speech-Web%20Speech%20API-38BDF8" alt="Speech API badge" />
  <img src="https://img.shields.io/badge/license-MIT-16A34A" alt="License badge" />
</p>

---

## 🚀 Overview

LEXIO is a polished browser-based reading workspace that turns raw text and real documents into a guided narration experience. Instead of acting like a basic text-to-speech demo, it combines document import, live word highlighting, multilingual voice filtering, AI-style reading assistance, and a structured workspace with dashboard, reader, and analysis views.

It is built for people who want speech playback to feel useful in a real workflow, not just sound output in a small textbox.

---

## 💡 What Is LEXIO?

LEXIO is a front-end reading and narration studio for:

- students reviewing notes and study material
- professionals turning reports into listenable briefings
- accessibility-focused users who need synchronized read-aloud support
- presenters who want quicker document digestion and speaking prep
- anyone who prefers listening to content while keeping visual context on screen

At the product level, LEXIO acts as:

- a multilingual document reader
- a browser-based text-to-speech workspace
- a structured office-file narration tool
- an AI-assisted reading companion with summaries, topics, glossary, and review prompts

---

## 🎯 Problem It Solves

Most lightweight text-to-speech tools break down when users try to do real document work:

- they read plain text, but not rich document formats
- they do not keep the visible content synced with spoken output
- voice selection is too shallow for language and accent preferences
- long documents become hard to follow
- there is no workspace for notes, quick summaries, or review prompts

LEXIO solves that by giving users one place to:

- import or paste content
- detect and organize document sections
- listen with browser voices filtered by language, accent, and persona
- follow along with live highlighted text
- switch between reading modes like executive, study, presentation, and accessibility
- generate quick AI-style outputs such as summaries, topic extraction, glossary terms, and Q&A prompts

---

## 🔗 Links

- **Live Demo**: [https://liambrooks-lab.github.io/LEXIO/](https://liambrooks-lab.github.io/LEXIO/)
- **GitHub Repository**: [https://github.com/liambrooks-lab/LEXIO](https://github.com/liambrooks-lab/LEXIO)
- **Issues**: [https://github.com/liambrooks-lab/LEXIO/issues](https://github.com/liambrooks-lab/LEXIO/issues)

---

## ✨ Current Product State

LEXIO currently ships with:

- a branded login and workspace onboarding flow
- three primary views: `Dashboard`, `Reader`, and `AI Studio`
- live document rendering with clickable word-level playback
- browser speech synthesis with language, accent, and persona filtering
- smart cleanup and natural chunking controls for better pacing
- local notes, user manual, and assistant side panels
- document analytics like word count, character count, read time, and section count
- AI-style summary, topics, glossary, action cues, and review prompt generation
- keyboard shortcuts for faster workspace control

---

## 🌟 Core Highlights

- multilingual narration controls for English, Hindi, Arabic, Italian, and Spanish
- synchronized document highlighting while reading
- import support for office files, ebooks, markup, and plain text
- phrase-based narration chunks instead of blunt one-word playback
- reading-mode presets for executive, study, presentation, and accessibility flows
- drag-and-drop document import
- focus mode for concentrated reading
- quick notes saved locally in the browser
- built-in assistant for workspace help and document-aware answers
- responsive product-style UI for demos and portfolio presentation

---

## 🧩 Product Surface

### Workspace experience

- branded login screen with profile photo upload
- navigation-driven workspace with dashboard, reader, and AI studio views
- top utility actions for manual, notes, and assistant access
- visible profile, voice-pack, and AI-confidence status chips

### Reader experience

- editable source text area for direct writing or pasted content
- document viewer that rebuilds imported content into readable sections
- click-to-read behavior from any visible word
- progress bar with start, pause, resume, and stop controls

### AI and review experience

- executive brief generation
- study notes mode
- presentation flow prompts
- glossary and topic extraction
- outline navigation and review cues

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

```text
LEXIO/
|- assets/
|  |- favicon.ico.ico
|  `- logo.svg
|- css/
|  `- components.css
|- docs/
|  |- API.md
|  |- CHANGELOG.md
|  |- CONTRIBUTING.md
|  `- readme/
|     |- author-rudranarayan-jena.jpg
|     |- lexio-ai-studio.png
|     |- lexio-dashboard.png
|     |- lexio-login.png
|     `- lexio-reader.png
|- js/
|  |- ai.js
|  |- auth.js
|  |- fileHandler.js
|  |- speech.js
|  `- utils.js
|- index.html
|- LICENSE
|- package.json
|- README.md
|- script.js
`- styles.css
```

---

## 🧠 Architecture

### Frontend responsibilities

- rendering the login and workspace interface
- managing view switching across dashboard, reader, and AI studio
- tracking document analytics and playback progress
- storing private notes locally in the browser
- powering assistant interactions and quick workspace help

### Document pipeline

1. The user pastes text or imports a supported file.
2. LEXIO parses the input based on its format.
3. The content is normalized into readable sections.
4. The document is rendered into a synchronized reading surface.
5. Analytics, language detection, and AI-style outputs are refreshed.
6. Playback begins with browser speech synthesis and live word highlighting.

### Speech flow

1. LEXIO selects the preferred language.
2. Matching voices are filtered by accent and persona.
3. The reading engine creates natural chunks for playback.
4. Spoken boundaries update the active word highlight and progress bar.

---

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Shift + D` opens `Dashboard`
- `Ctrl/Cmd + Shift + R` opens `Reader`
- `Ctrl/Cmd + Shift + A` opens `AI Studio`
- `Ctrl/Cmd + Shift + E` focuses the source editor
- `Ctrl/Cmd + Shift + U` opens document import
- `Ctrl/Cmd + Enter` starts, pauses, or resumes narration
- `Ctrl/Cmd + .` opens the AI Assistant
- `Ctrl/Cmd + /` opens the User Manual
- `Ctrl/Cmd + Shift + N` opens Notes

---

## ⚙️ Local Setup

### Prerequisites

- Node.js `14+`
- npm `6+`
- a modern browser with Web Speech API support

### Install dependencies

```bash
npm install
```

### Start locally

```bash
npm run dev
```

### Alternate local run

```bash
npm start
```

### Default local URL

- `http://localhost:3000`

---

## 🧪 Validation Snapshot

The current repository includes:

- a runnable local development workflow through `live-server`
- modular JavaScript split across auth, file import, speech, AI, and utility layers
- no automated test suite configured yet beyond the placeholder `npm test` script

---

## 🤝 Contributing

Contributions, improvements, UI refinements, and documentation cleanups are welcome.

Please review [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) before opening a pull request.

Suggested flow:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit and push your work.
5. Open a pull request.

---

## 📜 License

LEXIO is released under the **MIT License**.

The full license text is available in [LICENSE](LICENSE).

License summary:

- copyright (c) 2024 Rudranarayan Jena
- permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software
- the software is provided "as is", without warranty of any kind

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
