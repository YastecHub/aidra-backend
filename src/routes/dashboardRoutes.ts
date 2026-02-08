import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalRaised:
 *                       type: number
 *                     activeCampaigns:
 *                       type: number
 *                     pendingPayments:
 *                       type: number
 *                     totalDonors:
 *                       type: number
 *                 activeCampaigns:
 *                   type: array
 *                 recentDonations:
 *                   type: array
 *                 notifications:
 *                   type: array
 */
router.get('/', authenticate, dashboardController.getDashboard);

export default router;
