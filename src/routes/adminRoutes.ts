import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import * as adminValidator from '../validators/adminValidator';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ── KYC Management ──

/**
 * @swagger
 * /api/admin/kyc/pending:
 *   get:
 *     summary: Get all users with pending KYC
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with pending KYC
 */
router.get('/kyc/pending', adminController.getPendingKYC);

/**
 * @swagger
 * /api/admin/kyc/{userId}/approve:
 *   patch:
 *     summary: Approve a user's KYC
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC approved
 *       400:
 *         description: User not found or KYC not pending
 */
router.patch('/kyc/:userId/approve', adminValidator.userIdValidator, validate, adminController.approveKYC);

/**
 * @swagger
 * /api/admin/kyc/{userId}/reject:
 *   patch:
 *     summary: Reject a user's KYC
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC rejected
 */
router.patch('/kyc/:userId/reject', [...adminValidator.userIdValidator, ...adminValidator.rejectValidator], validate, adminController.rejectKYC);

// ── Campaign Management ──

/**
 * @swagger
 * /api/admin/campaigns:
 *   get:
 *     summary: Get all campaigns (optionally filter by status)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, underReview, completed, rejected]
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get('/campaigns', adminValidator.campaignStatusFilterValidator, validate, adminController.getAllCampaigns);

/**
 * @swagger
 * /api/admin/campaigns/{campaignId}/approve:
 *   patch:
 *     summary: Approve and activate a campaign
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign activated
 */
router.patch('/campaigns/:campaignId/approve', adminValidator.campaignIdValidator, validate, adminController.approveCampaign);

/**
 * @swagger
 * /api/admin/campaigns/{campaignId}/reject:
 *   patch:
 *     summary: Reject a campaign
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign rejected
 */
router.patch('/campaigns/:campaignId/reject', [...adminValidator.campaignIdValidator, ...adminValidator.rejectValidator], validate, adminController.rejectCampaign);

// ── User Management ──

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/users/:userId', adminValidator.userIdValidator, validate, adminController.getUserById);

// ── Donations ──

/**
 * @swagger
 * /api/admin/donations:
 *   get:
 *     summary: Get all donations (optionally filter by status)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *     responses:
 *       200:
 *         description: List of donations
 */
router.get('/donations', adminValidator.statusFilterValidator, validate, adminController.getAllDonations);

// ── Platform Analytics ──

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     verifiedUsers:
 *                       type: number
 *                     pendingKYC:
 *                       type: number
 *                 campaigns:
 *                   type: object
 *                   properties:
 *                     totalCampaigns:
 *                       type: number
 *                     activeCampaigns:
 *                       type: number
 *                     draftCampaigns:
 *                       type: number
 *                     underReviewCampaigns:
 *                       type: number
 *                 donations:
 *                   type: object
 *                   properties:
 *                     totalDonations:
 *                       type: number
 *                     pendingDonations:
 *                       type: number
 *                     totalRaised:
 *                       type: number
 *                     totalFees:
 *                       type: number
 */
router.get('/stats', adminController.getPlatformStats);

export default router;
