import { AIModel } from '../types/chat';

export const BRAND = {
  name: 'Lumora Neural',
  shortName: 'Lumora',
  tagline: 'Futuristic Intelligence at Scale',
  subtitle: 'A high-velocity neural workspace engineered for deep exploration, algorithmic synthesis, and creative mastery.',
  version: '2.0.0',
  storageKey: 'lumora_ai_store_v2',
  settingsKey: 'lumora_ai_settings_v2',
  authKey: 'lumora_auth_session_v2',
  defaultModel: 'gemini-3.1-flash-lite',
  models: [
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      shortName: '3.1 Flash Lite',
      tier: 'free',
      badge: 'FREE TIER',
      description: 'Ultra-low latency intelligence with instant stream execution. Free for everyone.',
    },
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash Neural',
      shortName: '3.8 Flash PRO',
      tier: 'pro',
      badge: 'PRO TIER',
      description: 'Extended multi-step reasoning, advanced algorithmic coding, and deep thinking.',
    },
  ] as AIModel[],
  defaultSystemInstruction:
    "You are Lumora AI, a futuristic and highly intelligent workspace assistant. " +
    "You provide clear, accurate, thoughtful, and well-structured responses. " +
    "Use GitHub-flavored markdown with clean formatting, code syntax blocks with language identifiers, bullet lists, bold text, and tables where helpful. " +
    "Be polite, concise when appropriate, and deeply informative when asked.",
  suggestions: [
    {
      id: 'quantum-tensor',
      tag: '01 / QUANTUM',
      title: 'Explain Quantum Superposition',
      prompt: 'Explain quantum computing and quantum superposition using intuitive physical analogies and mathematical intuition.',
      icon: 'Cpu',
    },
    {
      id: 'neural-launch',
      tag: '02 / SYNTHESIS',
      title: 'Draft Product Launch Copy',
      prompt: 'Write an electrifying, modern launch announcement for our next-generation autonomous AI developer platform.',
      icon: 'Zap',
    },
    {
      id: 'python-concurrency',
      tag: '03 / CODE SYNTH',
      title: 'Async Python Crawler',
      prompt: 'Architect a production-ready Python asynchronous scraper using asyncio, aiohttp, and type annotations.',
      icon: 'Terminal',
    },
    {
      id: 'breakthrough-ideas',
      tag: '04 / STRATEGY',
      title: 'Brainstorm Breakthrough Features',
      prompt: 'Generate 5 revolutionary, defensible product concepts for an AI-native workspace with real-time graph memory.',
      icon: 'Orbit',
    },
  ],
};
