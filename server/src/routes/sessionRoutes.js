import { Router } from 'express';
import {
  createEvents,
  createRun,
  finishSession,
  getSessionReport,
  startSession,
} from '../controllers/sessionController.js';

const router = Router();
router.post('/', startSession);
router.post('/:id/runs', createRun);
router.post('/:id/events', createEvents);
router.post('/:id/finish', finishSession);
router.get('/:id/report', getSessionReport);

export default router;