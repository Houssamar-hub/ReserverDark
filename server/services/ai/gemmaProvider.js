/**
 * @file gemmaProvider.js
 * @description Provider integration for Google Gemma 4 via the Gemini API.
 * 
 * NOTE ON HOSTED GEMMA API:
 * Gemma weights are open models developed by Google DeepMind.
 * Using Gemma via the Gemini API provides cloud-hosted, managed inference
 * without requiring local GPUs or hardware installations.
 */

import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';

class GemmaProvider {
  constructor() {
    this.apiKey = process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY || '';
    // Model identifier: configurable via GEMMA_MODEL / GEMINI_MODEL env var
    // Default: 'gemini-2.0-flash' or 'gemma-4-26b-a4b-it'
    this.modelName = process.env.GEMMA_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.timeoutMs = parseInt(process.env.GEMMA_TIMEOUT_MS, 10) || 15000;
    this.clientGenAI = null;
    this.legacyClient = null;

    this._initClients();
  }

  _initClients() {
    if (this.apiKey) {
      try {
        this.clientGenAI = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('⚠️ Could not initialize @google/genai, fallback available:', err.message);
      }
      try {
        this.legacyClient = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        console.warn('⚠️ Could not initialize @google/generative-ai:', err.message);
      }
    }
  }

  /**
   * Dynamically configure or update the API Key
   */
  configureKey(key) {
    if (!key || typeof key !== 'string') return;
    this.apiKey = key.trim();
    this._initClients();
  }

  /**
   * Health and configuration status check
   */
  getStatus() {
    return {
      provider: 'Google Gemma via Gemini API',
      model: this.modelName,
      isConfigured: Boolean(this.apiKey),
      isHostedApi: true,
      requiresLocalGpu: false,
      sdk: '@google/genai',
    };
  }

  /**
   * Generate text using Gemma
   */
  async generateText({ systemInstruction, prompt }) {
    if (!this.apiKey) {
      const err = new Error('GEMMA_API_KEY is not configured in backend environment.');
      err.code = 'API_KEY_MISSING';
      err.status = 503;
      throw err;
    }

    const candidateModels = [
      this.modelName,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemma-2-9b-it',
    ];

    let lastError = null;

    for (const modelId of candidateModels) {
      try {
        // Primary: @google/genai SDK
        if (this.clientGenAI) {
          const response = await this.clientGenAI.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || undefined,
              temperature: 0.3,
            },
          });
          if (response?.text) return response.text;
        }

        // Secondary: @google/generative-ai SDK
        if (this.legacyClient) {
          const model = this.legacyClient.getGenerativeModel({
            model: modelId,
            systemInstruction,
          });
          const result = await model.generateContent(prompt);
          const txt = result?.response?.text();
          if (txt) return txt;
        }
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Model ${modelId} failed, trying next candidate:`, err.message);
      }
    }

    if (lastError) {
      this._handleApiError(lastError);
    }
    throw new Error('All model candidates failed');
  }

  /**
   * Generate structured JSON output using Gemma
   */
  async generateJson({ systemInstruction, prompt, schemaDescription }) {
    const formattedPrompt = `${prompt}

IMPORTANT: Respond with ONLY a valid, raw JSON object matching this schema. Do NOT enclose in markdown code blocks like \`\`\`json. Do not include introductory or concluding text:
${schemaDescription || ''}`;

    const raw = await this.generateText({
      systemInstruction: (systemInstruction ? systemInstruction + '\n' : '') +
        'You are an expert real estate reasoning engine. You must output strictly valid JSON with no markdown wrapping.',
      prompt: formattedPrompt,
    });

    try {
      // Clean possible markdown code fences if model included them
      let cleaned = raw.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
      }
      return JSON.parse(cleaned);
    } catch (parseErr) {
      const error = new Error(`Failed to parse AI JSON response: ${parseErr.message}`);
      error.code = 'MALFORMED_AI_OUTPUT';
      error.rawResponse = raw;
      throw error;
    }
  }

  /**
   * Normalize provider error codes
   */
  _handleApiError(error) {
    const message = error.message || '';
    const status = error.status || 500;

    const wrapped = new Error();
    wrapped.originalMessage = message;

    if (message.includes('API key') || message.includes('API_KEY_INVALID') || status === 401 || status === 403) {
      wrapped.message = 'The configured GEMMA_API_KEY is invalid or unauthorized. Please verify your Gemini API key in server/.env.';
      wrapped.code = 'INVALID_API_KEY';
      wrapped.status = 401;
    } else if (message.includes('not found') || message.includes('unsupported') || message.includes('is not available')) {
      wrapped.message = `Model "${this.modelName}" is not available for this account. You can set GEMMA_MODEL=gemini-2.5-flash or gemini-1.5-flash in server/.env.`;
      wrapped.code = 'MODEL_UNAVAILABLE';
      wrapped.status = 400;
    } else if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
      wrapped.message = 'Gemini API rate limit or quota exceeded. Please wait a moment before trying again.';
      wrapped.code = 'RATE_LIMIT_EXCEEDED';
      wrapped.status = 429;
    } else if (message.includes('timed out') || message.includes('ETIMEDOUT') || message.includes('ECONNRESET')) {
      wrapped.message = 'Request to AI provider timed out. Please check your network connection.';
      wrapped.code = 'PROVIDER_TIMEOUT';
      wrapped.status = 504;
    } else {
      wrapped.message = `AI Provider Error: ${message}`;
      wrapped.code = 'PROVIDER_ERROR';
      wrapped.status = 500;
    }

    throw wrapped;
  }
}

// Singleton export
export const gemmaProvider = new GemmaProvider();
export default gemmaProvider;
