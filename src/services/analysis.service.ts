import axios from 'axios';
import OpenAI from 'openai';
import { SentimentResult } from '../types/index.js';

const LLM_PROVIDER = (process.env.LLM_PROVIDER || 'mock').toLowerCase();

export interface MockReview { rating: number; content: string }

export async function fetchProductReviews(productUrl: string): Promise<{ name: string; reviews: MockReview[] }> {
  const name = `Product ${Math.abs(hashCode(productUrl)) % 1000}`;
  const reviews: MockReview[] = Array.from({ length: 15 }).map((_, i) => ({
    rating: 3 + ((i % 5) - 2) * 0.5 + Math.random() * 0.5,
    content: sampleReview(i),
  }));
  return { name, reviews };
}

function sampleReview(i: number): string {
  const samples = [
    'Battery life is great and lasts all day.',
    'The camera quality is average, could be better.',
    'Build quality feels premium and sturdy.',
    'Performance is snappy, apps open quickly.',
    'Display is vibrant but a bit dim outdoors.',
    'Customer support was helpful and quick.',
    'Price is a bit high for the features.',
  ];
  return samples[i % samples.length]!;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}

export async function analyzeSentiment(productName: string, reviewTexts: string[]): Promise<SentimentResult> {
  if (LLM_PROVIDER === 'openai') return analyzeWithOpenAI(productName, reviewTexts);
  if (LLM_PROVIDER === 'gemini') return analyzeWithGemini(productName, reviewTexts);
  return analyzeWithMock(productName, reviewTexts);
}

async function analyzeWithOpenAI(productName: string, reviewTexts: string[]): Promise<SentimentResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildPrompt(productName, reviewTexts);
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You analyze customer reviews and return strict JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const raw = response.choices?.[0]?.message?.content || '{}';
  return safeParseAnalysis(raw, productName);
}

async function analyzeWithGemini(productName: string, reviewTexts: string[]): Promise<SentimentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = buildPrompt(productName, reviewTexts);
  const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } } as const;
  const { data } = await axios.post(url, payload);
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return safeParseAnalysis(text, productName);
}

function buildPrompt(productName: string, reviewTexts: string[]): string {
  return `Analyze the following product reviews and return ONLY JSON with keys: productName, sentimentSummary {positive, neutral, negative}, sampleInsights (array of short phrases). Product: ${productName}. Reviews:\n${reviewTexts.map((t, i) => `#${i+1}: ${t}`).join('\n')}`;
}

function safeParseAnalysis(text: string, _productName: string): SentimentResult {
  try {
    const parsed = JSON.parse(text) as Partial<SentimentResult & { sentimentSummary: any }>;
    const summary = parsed.sentimentSummary || {};
    return {
      sentimentSummary: {
        positive: Number(summary.positive) || 0,
        neutral: Number(summary.neutral) || 0,
        negative: Number(summary.negative) || 0,
      },
      sampleInsights: Array.isArray(parsed.sampleInsights) ? parsed.sampleInsights.slice(0, 5) : [],
    };
  } catch {
    return analyzeWithMock(_productName, []);
  }
}

function analyzeWithMock(_productName: string, _reviewTexts: string[]): SentimentResult {
  const positive = 70;
  const neutral = 20;
  const negative = 10;
  const sampleInsights = [
    'Great battery life',
    'Camera is average',
  ];
  return { sentimentSummary: { positive, neutral, negative }, sampleInsights };
}
