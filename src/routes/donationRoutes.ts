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
 *     summary: Create a donation (public, no auth required)
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - amount
 *               - payCurrency
 *             properties:
 *               campaignId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               payCurrency:
 *                 type: string
 *                 description: Crypto currency to pay with (e.g. btc, eth, usdt)
 *               donorEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Payment created, returns pay address and amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donationId:
 *                   type: string
 *                 nowPaymentId:
 *                   type: number
 *                 payAddress:
 *                   type: string
 *                 payAmount:
 *                   type: number
 *                 payCurrency:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *       400:
 *         description: Validation error or campaign not active
 */
router.post('/', donationValidator.createDonationValidator, validate, donationController.createDonation);

/**
 * @swagger
 * /api/donations/checkout:
 *   post:
 *     summary: Create a hosted-checkout donation (returns an invoice URL for in-app payment)
 *     description: Creates a NOWPayments hosted invoice. Frontend opens `invoiceUrl` in a modal/popup/iframe so users pay without leaving the app. `payCurrency` is optional — if omitted, the checkout page lets the user pick. `successUrl`/`cancelUrl` are where NOWPayments redirects after the flow.
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - amount
 *             properties:
 *               campaignId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               donorEmail:
 *                 type: string
 *                 format: email
 *               payCurrency:
 *                 type: string
 *                 description: Optional preferred crypto (e.g. usdttrc20). If omitted, user picks on the hosted page.
 *               successUrl:
 *                 type: string
 *                 description: URL NOWPayments redirects to after successful payment
 *               cancelUrl:
 *                 type: string
 *                 description: URL NOWPayments redirects to if payment is cancelled
 *     responses:
 *       201:
 *         description: Invoice created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donationId:
 *                   type: string
 *                 invoiceId:
 *                   type: string
 *                 invoiceUrl:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *       400:
 *         description: Validation error or campaign not active
 */
router.post('/checkout', donationValidator.createCheckoutValidator, validate, donationController.createDonationCheckout);

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
