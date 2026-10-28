import { ChatMessage } from '../types/chat';

export interface SendChatStreamParams {
  messages: Array<{ role: 'user' | 'assistant' | 'model'; content: string }>;
  model: string;
  systemInstruction?: string;
  temperature?: number;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export async function sendChatStream({
  messages,
  model,
  systemInstruction,
  temperature,
  signal,
  onChunk,
  onComplete,
  onError,
}: SendChatStreamParams): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        systemInstruction,
        temperature,
      }),
      signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        onError(
          'API Route 404 Not Found: If running on Vercel, please ensure GEMINI_API_KEY is added under Project Settings > Environment Variables and redeploy so /api/chat.ts is active.'
        );
        return;
      }
      const errorJson = await response.json().catch(() => ({}));
      const message = errorJson.error || `Server responded with status ${response.status}`;
      onError(message);
      return;
    }

    if (!response.body) {
      onError('Response stream is unavailable from the server.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const block of lines) {
        const trimmed = block.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'chunk' && data.text) {
              onChunk(data.text);
            } else if (data.type === 'error') {
              onError(data.error || 'An error occurred during response generation.');
              return;
            } else if (data.type === 'done') {
              onComplete();
              return;
            }
          } catch {
            // Incomplete or non-JSON chunk, ignore
          }
        }
      }
    }

    onComplete();
  } catch (err: any) {
    if (err?.name === 'AbortError' || signal?.aborted) {
      // User aborted stream
      onComplete();
      return;
    }
    const message = err?.message || 'Network error occurred while contacting Lumora AI servers.';
    onError(message);
  }
}
