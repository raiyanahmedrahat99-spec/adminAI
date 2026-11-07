import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

async function callAiWithRetry(fn: (modelName: string) => Promise<any>, primaryModel = 'gemini-3.5-flash-lite', maxRetries = 3) {
  let lastError;
  const models = [primaryModel, 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  
  for (let i = 0; i < maxRetries && i < models.length; i++) {
    const modelToUse = models[i];
    try {
      return await fn(modelToUse);
    } catch (error: any) {
      lastError = error;
      const errorStr = (JSON.stringify(error) + ' ' + (error.message || '')).toLowerCase();
      const isUnavailable = errorStr.includes('503') || error.status === 503 || errorStr.includes('unavailable') || errorStr.includes('high demand') || errorStr.includes('overloaded');
      const isQuotaExceeded = errorStr.includes('429') || error.status === 429 || errorStr.includes('quota') || errorStr.includes('resource_exhausted');
      const isNotFound = errorStr.includes('404') || error.status === 404 || errorStr.includes('not_found');
      
      if (isUnavailable && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; 
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if ((isQuotaExceeded || isNotFound) && i < models.length - 1) {
        continue;
      }

      throw error;
    }
  }
  throw lastError;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in Vercel Environment Variables. Please add GEMINI_API_KEY in Vercel Project Settings > Environment Variables.',
    });
  }

  try {
    const { message, history, contextData } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getAiClient();
    const systemInstruction = `You are the official Admin Executive AI Assistant for "Towa" (towastore.shop). 
Executive, data-driven, professional tone. Support Bengali and English.
NO GREETINGS. NO FAKE DATA.`;

    const contextSummary = contextData ? `LIVE SNAPSHOT:
Catalog: ${contextData.totalCatalogCount || 186} items
Valuation: ৳${(contextData.totalInventoryValuationCostBDT || 0).toLocaleString()}
Margin: ${contextData.averageProfitMarginPct || 16.8}%
Pending COD: ৳${(contextData.codPendingSettlementBDT || 3040).toLocaleString()}` : '';

    let dialogueHistoryText = '';
    if (Array.isArray(history)) {
      dialogueHistoryText = history.slice(-6).map((h: any) => `${h.sender}: ${h.text}`).join('\n\n');
    }

    const fullPrompt = `${contextSummary}\n\n${dialogueHistoryText}\n\nQUERY: ${message}`;

    const response = await callAiWithRetry((modelName) => {
      const isThinkingModel = modelName.includes('3.8') || modelName.includes('4') || modelName.includes('argon');
      return ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: {
          systemInstruction,
          thinkingConfig: isThinkingModel ? { thinkingLevel: ThinkingLevel.LOW } : undefined,
        },
      });
    }, 'gemini-3.5-flash-lite', 3);

    return res.status(200).json({ reply: response.text || 'Operational audit complete.' });
  } catch (error: any) {
    console.error('Error in chat-auditor:', error);
    return res.status(500).json({ error: error.message || 'Executive AI processing failed.' });
  }
}
