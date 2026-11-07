import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize GoogleGenAI client according to AI Studio guidelines
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] CRITICAL: GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Robust AI caller with retry logic for 429 (Quota/Rate Limit), 503 (Overloaded), and temporary network issues
 * Now includes model fallback to handle capacity issues across different versions.
 */
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
        console.warn(`[Gemini] Model ${modelToUse} busy (503). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if ((isQuotaExceeded || isNotFound) && i < models.length - 1) {
        console.warn(`[Gemini] Model ${modelToUse} hit limit/unavailable (${error.status || 'error'}). Falling back to ${models[i + 1]}...`);
        continue;
      }

      throw error;
    }
  }
  throw lastError;
}

// ==================================================
// DIRECTIVE 1: AUTOMATED PRODUCT DESCRIPTION & MARKET PRICING
// ==================================================
app.post('/api/ai/generate-product', async (req: Request, res: Response) => {
  try {
    const { title, category, stockDetails, rawSpecs, currentCost } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Product Title and Category are required.' });
    }

    const ai = getAiClient();

    const systemInstruction = `You are the official Admin Executive AI Assistant for "Towa" (towastore.shop), an e-commerce platform in Bangladesh specializing in daily essentials.
Generate structured product metadata:
1. English Description: Crisp, modern e-commerce copy.
2. Bengali Description: Natural, professional Bengali copy.
3. Market Price Suggestion (BDT): Realistic Bangladesh retail price.
4. Suggested procurement cost & margin.
STRICT RULES: Output valid JSON only. No preamble.`;

    const prompt = `Product Title: "${title}"
Category: "${category}"
${rawSpecs ? `Raw Specifications: ${rawSpecs}` : ''}
${stockDetails ? `Stock Details: ${stockDetails}` : ''}
${currentCost ? `Wholesale Cost: ${currentCost} BDT` : ''}
Generate product metadata and retail price suggestion for Bangladesh market.`;

    const response = await callAiWithRetry((modelName) => {
      const isThinkingModel = modelName.includes('3.8') || modelName.includes('4') || modelName.includes('argon');
      return ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          thinkingConfig: isThinkingModel ? { thinkingLevel: ThinkingLevel.LOW } : undefined,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggested_price_bdt: { type: Type.NUMBER },
              suggested_cost_bdt: { type: Type.NUMBER },
              margin_percentage: { type: Type.NUMBER },
              description_english: { type: Type.STRING },
              description_bengali: { type: Type.STRING },
              key_features: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommended_reorder_level: { type: Type.NUMBER },
              sku_suggestion: { type: Type.STRING },
              rationale: { type: Type.STRING },
            },
            required: ['suggested_price_bdt', 'description_english', 'description_bengali'],
          },
        },
      });
    }, 'gemini-3.5-flash-lite', 3);

    const text = response.text;
    if (!text) throw new Error('Empty response received from Gemini.');
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error generating product metadata:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate product metadata.' });
  }
});

// ==================================================
// DIRECTIVE 2: ADMIN OPERATIONS & FINANCIAL EXECUTIVE AUDITOR
// ==================================================
app.post('/api/ai/chat-auditor', async (req: Request, res: Response) => {
  try {
    const { message, history, contextData } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

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

    return res.json({ reply: response.text || 'Operational audit complete.' });
  } catch (error: any) {
    console.error('Error in chat-auditor:', error);
    return res.status(500).json({ error: error.message || 'Executive AI processing failed.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = 3000;
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${PORT}`));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
