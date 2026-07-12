import { Router } from 'express';
import * as ai from '../controllers/ai.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/health-scores', authorize('admin', 'asset_manager'), ai.getHealthScores);
router.get('/predictions', authorize('admin', 'asset_manager'), ai.getPredictions);
router.get('/insights', ai.getDashboardInsights);
router.post('/search', ai.naturalLanguageSearch);

export default router;
