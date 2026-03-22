# LEXIO API Documentation

**Version:** 1.0.0  
**Base URL:** `https://liambrooks-lab.github.io/LEXIO`

## Overview

LEXIO provides a simple, powerful Text-to-Speech API for web applications. Currently client-side only, with cloud API coming soon.

## Core Objects

### `window.speechSynthesis`
The native Web Speech API interface.

### `LEXIO Object`
```javascript
window.LEXIO = {
    // Core properties
    isReading: boolean,
    isPaused: boolean,
    currentWordIndex: number,
    allWords: array,
    
    // Core methods
    startReading(startIndex),
    stopReading(),
    pauseReading(),
    resumeReading(),
    
    // Utility methods
    updateDisplayText(text),
    showStatus(message, type),
    addActivity(message)
}