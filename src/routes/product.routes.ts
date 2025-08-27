import { Router } from 'express';
import { analyzeProduct } from '../controllers/product.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/analyze', authRequired, analyzeProduct);

export default router;
