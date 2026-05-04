import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as userValidator from '../validators/userValidator';
import { uploadKYC } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/me', authenticate, userValidator.updateProfileValidator, validate, userController.updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch('/change-password', authenticate, userValidator.changePasswordValidator, validate, userController.changePassword);

/**
 * @swagger
 * /api/users/kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: KYC documents (PDF, JPEG, PNG - Max 10MB per file)
 *     responses:
 *       200:
 *         description: KYC submitted for review
 *       400:
 *         description: Invalid file type or no files provided
 */
router.post('/kyc/submit', authenticate, uploadKYC.array('documents'), userValidator.submitKYCValidator, validate, userController.submitKYC);

/**
 * @swagger
 * /api/users/kyc/status:
 *   get:
 *     summary: Get KYC verification status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved
 */
router.get('/kyc/status', authenticate, userController.getKYCStatus);

export default router;
