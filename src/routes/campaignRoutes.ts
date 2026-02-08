import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';
import { authenticate } from '../middleware/auth';
import { requireKYC } from '../middleware/kyc';
import { validate } from '../middleware/validate';
import * as campaignValidator from '../validators/campaignValidator';

const router = Router();

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign (KYC required)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - goalAmount
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               goalAmount:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: uri
 *               category:
 *                 type: string
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       403:
 *         description: KYC verification required
 */
router.post('/', authenticate, requireKYC, campaignValidator.createCampaignValidator, validate, campaignController.createCampaign);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, title, -title]
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get('/', campaignValidator.getCampaignsValidator, validate, campaignController.getAllCampaigns);

/**
 * @swagger
 * /api/campaigns/my-campaigns:
 *   get:
 *     summary: Get user's campaigns
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's campaigns retrieved
 */
router.get('/my-campaigns', authenticate, campaignController.getMyCampaigns);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign details
 *       404:
 *         description: Campaign not found
 */
router.get('/:id', campaignValidator.campaignIdValidator, validate, campaignController.getCampaignById);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   patch:
 *     summary: Update campaign (owner only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               goalAmount:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign updated
 */
router.patch('/:id', authenticate, campaignValidator.updateCampaignValidator, validate, campaignController.updateCampaign);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign (owner only)
 *     tags: [Campaigns]
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
 *         description: Campaign deleted
 */
router.delete('/:id', authenticate, campaignValidator.campaignIdValidator, validate, campaignController.deleteCampaign);

export default router;
