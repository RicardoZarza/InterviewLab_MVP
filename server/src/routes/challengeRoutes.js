import { Router } from 'express';
import { listChallenges } from '../controllers/challengeController.js';

const router = Router();
router.get('/', listChallenges);

export default router;