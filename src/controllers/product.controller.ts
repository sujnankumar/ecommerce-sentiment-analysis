import { Request, Response, NextFunction } from 'express';
import { Product, Review, Analysis } from '../models/index.js';
import { fetchProductReviews, analyzeSentiment } from '../services/analysis.service.js';

export const analyzeProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productUrl } = req.body as { productUrl?: string };
    if (!productUrl) return res.status(400).json({ message: 'productUrl is required' });

  const { name, reviews } = await fetchProductReviews(productUrl);
  const prodName = name || 'Product';
  const [product] = await Product.findOrCreate({ where: { url: productUrl }, defaults: { url: productUrl, name: prodName } });

    await Review.destroy({ where: { productId: product.id } });
    const createdReviews = await Review.bulkCreate(
      reviews.map((r: { rating: number; content: string }) => ({ productId: product.id, rating: r.rating, content: r.content }))
    );

    const analysis = await analyzeSentiment(name, createdReviews.map((r) => r.content));

    const payload = {
  productName: product.name,
      averageRating: Number(
        (createdReviews.reduce((s, r) => s + r.rating, 0) / createdReviews.length).toFixed(2)
      ),
      totalReviews: createdReviews.length,
      sentimentSummary: analysis.sentimentSummary,
      sampleInsights: analysis.sampleInsights,
    };

    await Analysis.create({
      userId: req.user!.id,
      productId: product.id,
      averageRating: payload.averageRating,
      totalReviews: payload.totalReviews,
      positive: payload.sentimentSummary.positive,
      neutral: payload.sentimentSummary.neutral,
      negative: payload.sentimentSummary.negative,
      sampleInsights: payload.sampleInsights,
    });

    res.json(payload);
  } catch (err) {
    next(err);
  }
};
