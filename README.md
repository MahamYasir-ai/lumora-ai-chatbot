# Lumora AI — Futuristic AI Chatbot Workspace

**Lumora AI** is a production-grade, responsive AI chatbot web application powered by Google's Gemini API and the official `@google/genai` TypeScript SDK. It features real-time SSE streaming responses, multi-turn conversational context memory, intelligent syntax highlighting, persistent browser LocalStorage, and a futuristic design system with radiant accents.

---

## Features

- **Gemini Free-Tier Integration**: Communicates with the official `@google/genai` SDK using `gemini-3.1-flash-lite` (low-latency default) and `gemini-3.8-flash` (extended reasoning).
- **Secure Server-Side Architecture**: An Express-powered `/api/chat` route processes requests, keeps your `GEMINI_API_KEY` confidential, and streams Server-Sent Events (SSE) directly to the browser.
- **Real-Time Streaming & Cancellation**: Progressive chunk-by-chunk text generation with an interactive **Stop Generation** button to halt generation at any moment.
- **Context-Aware Multi-Turn Conversations**: Sends past conversation turns to Gemini so it understands follow-up questions and references.
- **Rich Markdown & Code Display**: Formats headers, bullet lists, tables, blockquotes, and fenced code blocks with language tags and instant "Copy code" feedback.
- **Message Interactions**:
  - Copy individual AI or user messages.
  - Edit and resend past user messages.
  - Regenerate AI responses.
- **LocalStorage Persistence**:
  - Saves all conversations, message histories, titles, and timestamps locally.
  - Categorizes chat history into **Today**, **Yesterday**, and **Earlier**.
  - Search conversation history in real time.
  - Rename and delete individual chats with confirmation dialogs.
  - Clear all history safely with versioned storage keys.
- **Customizable Workspace Settings**:
  - **Themes**: Dark, Light, and System themes.
  - **Models**: Switch between `Gemini 3.1 Flash Lite` and `Gemini 3.8 Flash`.
  - **Creativity / Temperature**: Adjust temperature from 0.0 (Precise) to 1.0 (Creative).
  - **Custom System Instruction**: Define custom persona and behavior for Lumora AI.
- **Responsive Design**:
  - Desktop: Collapsible sidebar navigation.
  - Mobile & Tablet: Slide-in navigation drawer with backdrop touch overlay.
  - Auto-resizing message composer with character limit indicator.
  - Smart scroll-to-bottom floating button when scrolling upwards.

---

## Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google Account.
3. Click **"Get API key"** in the top navigation or sidebar.
4. Click **"Create API key"** in an existing or new Google Cloud project.
5. Copy your API key (starts with `AIzaSy...` or provided key string).

---

## Environment Setup

Create a `.env.local` file in the root of your project:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

A template `.env.example` is provided in the repository:

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted
APP_URL="MY_APP_URL"
```

> **Security Note:** Never commit `.env.local` or `.env` files containing real secrets to version control. They are automatically ignored in `.gitignore`.

---

## Installation & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start the production server**:
   ```bash
   npm run start
   ```

---

## Project Structure

```
├── .env.example              # Environment variables template
├── .env.local                # Local private secrets (ignored by git)
├── index.html                # HTML entry point with metadata & fonts
├── metadata.json             # AI Studio applet capabilities
├── package.json              # Dependencies and scripts
├── server.ts                 # Express full-stack server & /api/chat streaming route
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── main.tsx              # React DOM mounting entry point
    ├── App.tsx               # Primary application state, layout, and orchestration
    ├── index.css             # Tailwind CSS imports and theme variables
    ├── config/
    │   └── brand.ts          # Centralized Lumora AI brand, models, suggestions
    ├── types/
    │   └── chat.ts           # Shared TypeScript interfaces & types
    ├── utils/
    │   └── storage.ts        # LocalStorage helpers, date grouping, versioning
    ├── services/
    │   └── chatApi.ts        # SSE stream consumer with AbortController support
    └── components/
        ├── chat/
        │   ├── ChatComposer.tsx    # Auto-resizing input with stop/send controls
        │   ├── ChatMessage.tsx     # Message bubbles, copy, edit, regenerate
        │   ├── CodeBlock.tsx       # Syntax code block with language badge & copy
        │   ├── ConfirmDialog.tsx   # Safe modal for destructive actions
        │   └── WelcomeScreen.tsx   # AI emblem and 4 suggestion prompt cards
        ├── sidebar/
        │   └── Sidebar.tsx         # Search, history grouping, rename, delete
        ├── settings/
        │   └── SettingsModal.tsx   # Theme, model, temperature, system prompt
        └── ui/
            ├── Modal.tsx           # Accessible animated dialog wrapper
            └── Toast.tsx           # Toast notifications system
```

---

## Supported Gemini Models

| Model Identifier | Display Name | Specialty |
|---|---|---|
| `gemini-3.1-flash-lite` | Gemini 3.1 Flash Lite | High-speed, low-latency, free-tier optimized |
| `gemini-3.8-flash` | Gemini 3.8 Flash | Deep multi-turn reasoning and complex STEM/code |

---

## License

Apache-2.0
