export default function handler(_req: any, res: any) {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.status(200).json({
    status: 'ok',
    app: 'Lumora AI',
    version: '2.0.0',
    platform: 'vercel-serverless',
    hasApiKey: hasKey,
    models: [
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tier: 'free' },
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tier: 'pro' },
    ],
  });
}
