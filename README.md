# LexiDoc — Intelligent PDF Chatbot

**LexiDoc** turns static PDF documents into interactive, intelligent AI conversations. Upload any PDF, ask questions in natural language, and get immediate answers complete with exact source page citations, real-time Text-to-Speech audio playback, and persistent session history.

---

## ✨ Features

- **Semantic PDF Ingestion & Chat**: Upload any PDF file to extract text, chunk content, and converse with an AI assistant.
- **Source Page Citations**: Every AI answer includes exact page references and excerpts from your PDF.
- **Client-Side Text-to-Speech (TTS)**:
  - Native Web Speech API integration (`window.speechSynthesis`).
  - Listen, pause, resume, and stop controls.
  - Real-time speech speed selector (`0.75x`, `1x`, `1.25x`, `1.5x`, `2x`).
  - Real-time word-level text highlighting synchronized with speech playback.
  - Automatic filtering of repetitive markdown formatting and divider symbols.
- **Personalized Profile**:
  - Upload custom profile pictures with automatic square-crop and compression via HTML5 Canvas.
  - Fallback dynamic letter initial avatars.
  - Synced across Profile Settings, navigation bar, and chat message bubbles.
- **Reliable Local Persistence**:
  - PDF files are persisted in IndexedDB as ArrayBuffers so you can seamlessly revisit previous chats and read the original PDF without re-uploading.
  - Conversation histories and theme settings persist in `localStorage`.
- **Dark & Light Mode**: Seamless theme toggle with persistent user preference.

---

## 🚀 Quick Start (Frontend)

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`. Upload any PDF and start chatting!

---

## 🛠️ Backend Setup (Optional RAG Integration)

```bash
cd backend
cp .env.example .env      # Add your API keys (Anthropic / NVIDIA)
npm install
npm run dev
```

---

## 📂 Project Structure

```
src/
├── components/     Navbar, Sidebar, UploadArea, PDFPreview, ChatWindow,
│                   ChatMessage, ChatInput, SourceReference, TextToSpeech,
│                   SettingsModal, LoadingAnimation, EmptyState
├── pages/          Home, Chat, History, About, Login
├── context/        AppContext.jsx — global state (Context API)
├── hooks/          useChat.js, useTextToSpeech.js
├── services/       api.js, pdfService.js (IndexedDB & localStorage)
└── utils/          helpers.js, stripMarkdown.js

backend/
├── server.js
├── routes/         upload.js, chat.js
└── services/       pdfService.js, vectorService.js, claudeService.js
```

## Notes

- Chat history and recent conversations persist to `localStorage` (`pdf-chat-history`, `pdf-chat-settings`) — the full PDF file itself is never stored there, only metadata.
- The frontend is fully responsive: a 3-column layout on desktop, a collapsible sidebar on tablet, and a PDF/Chat tab switcher on mobile.
- `npm install` requires network access, which this environment doesn't have — run it locally after downloading the project.
