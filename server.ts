import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Supported models for Lumora AI
const SUPPORTED_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite (Recommended)',
    badge: 'Lightning Fast',
    description: 'Instant response time, high availability, and efficient intelligence for everyday tasks',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Deep Reasoning',
    description: 'Extended reasoning and multi-step conversational depth (may experience high demand)',
  },
];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check and config endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    app: 'Lumora AI',
    version: '1.0.0',
    hasApiKey: hasKey,
    models: SUPPORTED_MODELS,
  });
});

// Chat streaming endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const { messages, model = 'gemini-3.1-flash-lite', systemInstruction, temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is missing or invalid on the server. Please check your environment variables.',
    });
    return;
  }

  // Format messages into Gemini format
  const formattedContents = messages
    .filter((m: { role: string; content?: string }) => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  if (formattedContents.length === 0) {
    res.status(400).json({ error: 'No valid message content provided.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let clientDisconnected = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
      console.log('[Lumora API] Client aborted connection');
    }
  });

  const defaultSystemInstruction =
    "You are Lumora AI, an intelligent, helpful, and articulate AI workspace assistant created with cutting-edge technology. " +
    "You provide clear, accurate, thoughtful, and well-structured responses. " +
    "Use GitHub-flavored markdown with clean formatting, code syntax blocks with language identifiers, bullet lists, bold text, and tables where helpful. " +
    "Be polite, concise when appropriate, and deeply informative when asked.";

  const activeInstruction = typeof systemInstruction === 'string' && systemInstruction.trim().length > 0
    ? systemInstruction.trim()
    : defaultSystemInstruction;

  const primaryModel = SUPPORTED_MODELS.some((m) => m.id === model) ? model : 'gemini-3.1-flash-lite';
  const fallbackModel = primaryModel === 'gemini-3.8-flash' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

  const aiClient = ai;

  async function streamModelResponse(client: GoogleGenAI, modelToUse: string): Promise<boolean> {
    console.log(`[Lumora API] Starting stream with model: ${modelToUse}`);
    const responseStream = await client.models.generateContentStream({
      model: modelToUse,
      contents: formattedContents,
      config: {
        systemInstruction: activeInstruction,
        temperature: Math.max(0, Math.min(1, Number(temperature) || 0.7)),
      },
    });

    for await (const chunk of responseStream) {
      if (clientDisconnected || res.writableEnded) {
        console.log('[Lumora API] Stream loop ended due to disconnect');
        break;
      }
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
    }
    return true;
  }

  try {
    try {
      await streamModelResponse(aiClient, primaryModel);
    } catch (primaryErr: any) {
      const errStr = (primaryErr?.message || String(primaryErr)).toLowerCase();
      if (
        (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable') || errStr.includes('timed out')) &&
        !clientDisconnected &&
        !res.writableEnded
      ) {
        console.warn(`Primary model ${primaryModel} busy/unavailable. Falling back to ${fallbackModel}...`);
        await streamModelResponse(aiClient, fallbackModel);
      } else {
        throw primaryErr;
      }
    }

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }
  } catch (err: any) {
    console.error('Gemini API stream error:', err);
    if (!clientDisconnected) {
      let friendlyMessage = 'An unexpected error occurred while communicating with Gemini.';
      const rawError = err?.message || String(err);

      if (rawError.includes('429') || rawError.toLowerCase().includes('quota') || rawError.toLowerCase().includes('rate limit')) {
        friendlyMessage = 'Free-tier Gemini API quota or rate limit reached. Please wait a few moments and try again.';
      } else if (rawError.includes('API_KEY_INVALID') || rawError.toLowerCase().includes('api key not valid')) {
        friendlyMessage = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local or settings.';
      } else if (rawError.toLowerCase().includes('high demand') || rawError.includes('503')) {
        friendlyMessage = 'Gemini servers are currently experiencing peak demand. Please wait a moment and try again.';
      } else if (rawError.toLowerCase().includes('not found') || rawError.toLowerCase().includes('unsupported model')) {
        friendlyMessage = `The requested model (${model}) is currently unavailable in this region.`;
      } else if (rawError.toLowerCase().includes('safety') || rawError.toLowerCase().includes('blocked')) {
        friendlyMessage = 'The response was filtered by safety guidelines. Please modify your prompt and try again.';
      } else {
        friendlyMessage = `Gemini API Error: ${rawError.slice(0, 200)}`;
      }

      res.write(`data: ${JSON.stringify({ type: 'error', error: friendlyMessage })}\n\n`);
      res.end();
    }
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Lumora AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
