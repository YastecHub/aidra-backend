import { Router } from 'express';
import * as donationController from '../controllers/donationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as donationValidator from '../validators/donationValidator';

const router = Router();

/**
 * @swagger
 * /api/donations:
 *   post:
 *     summary: Create a donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign
 *               - amount
 *               - paymentMethod
 *             properties:
 *               campaign:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, crypto, bank]
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *     responses:
 *       201:
 *         description: Donation created
 */
router.post('/', authenticate, donationValidator.createDonationValidator, validate, donationController.createDonation);

/**
 * @swagger
 * /api/donations/my-donations:
 *   get:
 *     summary: Get user's donation history
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's donations
 */
router.get('/my-donations', authenticate, donationController.getMyDonations);

/**
 * @swagger
 * /api/donations/campaign/{id}:
 *   get:
 *     summary: Get donations for a campaign (owner only)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign donations
 */
router.get('/campaign/:id', authenticate, donationValidator.campaignIdValidator, validate, donationController.getCampaignDonations);

export default router;
