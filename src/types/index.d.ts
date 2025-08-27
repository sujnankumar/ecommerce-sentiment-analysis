import 'express';

export interface JwtPayloadExt {
  sub: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

export interface SentimentResult {
  sentimentSummary: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sampleInsights: string[];
}
