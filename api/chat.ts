import { GoogleGenAI } from '@google/genai';

const SUPPORTED_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tier: 'free',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tier: 'pro',
  },
];

export default async function handler(req: any, res: any) {
  // Handle CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { messages, model = 'gemini-3.1-flash-lite', systemInstruction, temperature = 0.7 } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not configured on Vercel. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.',
    });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const formattedContents = messages
    .filter((m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  if (formattedContents.length === 0) {
    res.status(400).json({ error: 'No valid message content provided.' });
    return;
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  let clientDisconnected = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
    }
  });

  const defaultSystemInstruction =
    "You are Lumora AI, a futuristic and highly intelligent workspace assistant. " +
    "You provide clear, accurate, thoughtful, and well-structured responses. " +
    "Use GitHub-flavored markdown with clean formatting, code syntax blocks with language identifiers, bullet lists, bold text, and tables where helpful. " +
    "Be polite, concise when appropriate, and deeply informative when asked.";

  const activeInstruction = typeof systemInstruction === 'string' && systemInstruction.trim().length > 0
    ? systemInstruction.trim()
    : defaultSystemInstruction;

  const primaryModel = SUPPORTED_MODELS.some((m) => m.id === model) ? model : 'gemini-3.1-flash-lite';
  const fallbackModel = primaryModel === 'gemini-3.8-flash' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

  async function streamModel(modelToUse: string): Promise<boolean> {
    const responseStream = await ai.models.generateContentStream({
      model: modelToUse,
      contents: formattedContents,
      config: {
        systemInstruction: activeInstruction,
        temperature: Math.max(0, Math.min(1, Number(temperature) || 0.7)),
      },
    });

    for await (const chunk of responseStream) {
      if (clientDisconnected || res.writableEnded) break;
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
      }
    }
    return true;
  }

  try {
    try {
      await streamModel(primaryModel);
    } catch (primaryErr: any) {
      const errStr = (primaryErr?.message || String(primaryErr)).toLowerCase();
      if (
        (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable') || errStr.includes('timed out')) &&
        !clientDisconnected &&
        !res.writableEnded
      ) {
        await streamModel(fallbackModel);
      } else {
        throw primaryErr;
      }
    }

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }
  } catch (err: any) {
    if (!res.writableEnded) {
      let friendlyMessage = 'An unexpected error occurred while communicating with Gemini.';
      const rawError = err?.message || String(err);

      if (rawError.includes('429') || rawError.toLowerCase().includes('quota') || rawError.toLowerCase().includes('rate limit')) {
        friendlyMessage = 'Free-tier Gemini API quota or rate limit reached. Please wait a moment and try again.';
      } else if (rawError.includes('API_KEY_INVALID') || rawError.toLowerCase().includes('api key not valid')) {
        friendlyMessage = 'Invalid Gemini API key configured in Vercel environment variables.';
      } else if (rawError.toLowerCase().includes('high demand') || rawError.includes('503')) {
        friendlyMessage = 'Gemini servers are currently experiencing peak demand. Please retry in a few moments.';
      } else {
        friendlyMessage = `Gemini API Error: ${rawError.slice(0, 200)}`;
      }

      res.write(`data: ${JSON.stringify({ type: 'error', error: friendlyMessage })}\n\n`);
      res.end();
    }
  }
}
