import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authRequired, getSummary);

export default router;
