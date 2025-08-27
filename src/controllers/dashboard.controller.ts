import { Request, Response, NextFunction } from 'express';
import { Analysis, Product } from '../models/index.js';

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Analysis.findAll({
      where: { userId: req.user!.id },
      include: [{ model: Product, attributes: ['name', 'url'] }],
      limit: 20,
      order: [['createdAt', 'DESC']],
    });

    const result = items.map((a) => ({
      id: a.id,
      productName: (a as any).product?.name as string | undefined,
      productUrl: (a as any).product?.url as string | undefined,
      averageRating: a.averageRating,
      totalReviews: a.totalReviews,
      sentimentSummary: {
        positive: a.positive,
        neutral: a.neutral,
        negative: a.negative,
      },
      sampleInsights: a.sampleInsights,
      createdAt: a.createdAt,
    }));

    res.json({ items: result });
  } catch (err) {
    next(err);
  }
};
