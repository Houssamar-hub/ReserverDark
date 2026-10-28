/**
 * @file gemmaProvider.js
 * @description Provider integration for Google Gemini API (gemini-flash-latest)
 * using the official Google REST endpoint and SDK.
 */

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';

class GemmaProvider {
  constructor() {
    this.configuredKey = '';
    this.modelName = process.env.GEMINI_MODEL || process.env.GEMMA_MODEL || 'gemini-flash-latest';
    this.timeoutMs = parseInt(process.env.GEMMA_TIMEOUT_MS, 10) || 15000;
    this.clientGenAI = null;
    this.legacyClient = null;

    this._initClients();
  }

  get key() {
    return this.configuredKey || process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY || '';
  }

  _initClients() {
    const key = this.key;
    if (key) {
      try {
        this.clientGenAI = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('⚠️ Could not initialize @google/genai, REST endpoint available:', err.message);
      }
      try {
        this.legacyClient = new GoogleGenerativeAI(key);
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
    this.configuredKey = key.trim();
    this._initClients();
  }

  /**
   * Health and configuration status check
   */
  getStatus() {
    return {
      provider: 'Google Gemma via Gemini API',
      model: this.modelName,
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`,
      isConfigured: Boolean(this.key),
      isHostedApi: true,
      requiresLocalGpu: false,
      authHeader: 'X-goog-api-key',
    };
  }

  /**
   * Generate text using Gemini API
   * Uses verified endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
   * Header: X-goog-api-key: {GEMINI_API_KEY}
   */
  async generateText({ systemInstruction, prompt, history = [] }) {
    if (process.env.NODE_ENV === 'test' && !process.env.TEST_LIVE_AI) {
      const err = new Error('Test mode: using offline engine');
      err.code = 'TEST_OFFLINE';
      throw err;
    }

    const key = this.key;
    if (!key) {
      const err = new Error('GEMINI_API_KEY is not configured in backend environment.');
      err.code = 'API_KEY_MISSING';
      err.status = 503;
      throw err;
    }

    const candidateModels = Array.from(
      new Set([
        this.modelName,
        'gemini-flash-latest',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
      ])
    );

    let lastError = null;

    for (const modelId of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

        const contents = [];
        if (history && history.length > 0) {
          for (const msg of history.slice(-6)) {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });

        const requestBody = { contents };
        if (systemInstruction) {
          requestBody.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs || 15000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': key,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await res.json();

        if (res.status === 200 && data.candidates && data.candidates[0]?.content?.parts) {
          return data.candidates[0].content.parts.map(p => p.text).join('\n').trim();
        }

        if (data.error) {
          // If 503 high demand spike or 404, fallback to next available flash model
          if (data.error.code === 503 || data.error.code === 404) {
            console.warn(`Model ${modelId} returned ${data.error.code}, cascading to next model...`);
            lastError = new Error(data.error.message);
            continue;
          }
          throw new Error(data.error.message || 'Gemini API Error');
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelId} error:`, err.message);
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
