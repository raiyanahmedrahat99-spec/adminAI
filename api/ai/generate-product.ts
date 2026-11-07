import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

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
    const { title, category, stockDetails, rawSpecs, currentCost } = req.body || {};

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
    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error generating product metadata:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate product metadata.' });
  }
}
