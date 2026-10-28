export const BRAND = {
  name: 'Lumora AI',
  shortName: 'Lumora',
  tagline: 'Ideas start here.',
  subtitle: 'The intelligent workspace for thoughtful exploration, creative breakthroughs, and code synthesis.',
  version: '1.0.0',
  storageKey: 'lumora_ai_store_v1',
  settingsKey: 'lumora_ai_settings_v1',
  defaultModel: 'gemini-3.1-flash-lite',
  models: [
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      badge: 'Recommended',
      description: 'Ultra-low latency and instant answers for real-time chatting.',
    },
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      badge: 'Deep Reasoning',
      description: 'Advanced reasoning, coding, and multi-turn conversational depth.',
    },
  ],
  defaultSystemInstruction:
    "You are Lumora AI, an intelligent, helpful, and articulate AI workspace assistant created with cutting-edge technology. " +
    "You provide clear, accurate, thoughtful, and well-structured responses. " +
    "Use GitHub-flavored markdown with clean formatting, code syntax blocks with language identifiers, bullet lists, bold text, and tables where helpful. " +
    "Be polite, concise when appropriate, and deeply informative when asked.",
  suggestions: [
    {
      id: 'explain-quantum',
      title: 'Explain a complex topic',
      prompt: 'Explain quantum computing and quantum superposition in simple, intuitive terms with relatable analogies.',
      category: 'Learn',
      icon: 'Atom',
    },
    {
      id: 'help-write',
      title: 'Help me write something',
      prompt: 'Write a compelling, professional announcement launching our new developer productivity platform.',
      category: 'Writing',
      icon: 'PenTool',
    },
    {
      id: 'build-python',
      title: 'Build a Python project',
      prompt: 'Write a clean, modular Python script using asyncio and aiohttp to fetch and summarize news articles.',
      category: 'Coding',
      icon: 'Code2',
    },
    {
      id: 'brainstorm-ideas',
      title: 'Brainstorm creative ideas',
      prompt: 'Brainstorm 5 innovative, high-impact features for an AI-powered personal knowledge management app.',
      category: 'Strategy',
      icon: 'Sparkles',
    },
  ],
};
