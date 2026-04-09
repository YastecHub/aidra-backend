import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { validate } from '../middleware/validate';
import * as paymentValidator from '../validators/paymentValidator';

const router = Router();

/**
 * @swagger
 * /api/payments/ipn:
 *   post:
 *     summary: NOWPayments IPN webhook (do not call manually)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: IPN processed
 *       403:
 *         description: Invalid signature
 */
router.post('/ipn', paymentController.handleIPN);

/**
 * @swagger
 * /api/payments/status/{donationId}:
 *   get:
 *     summary: Get payment status for a donation
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: donationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 *       400:
 *         description: Invalid donation ID
 */
router.get('/status/:donationId', paymentValidator.donationIdValidator, validate, paymentController.getPaymentStatus);

/**
 * @swagger
 * /api/payments/currencies:
 *   get:
 *     summary: Get available crypto currencies for payment
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of available currencies
 */
router.get('/currencies', paymentController.getAvailableCurrencies);

/**
 * @swagger
 * /api/payments/estimate:
 *   get:
 *     summary: Get estimated crypto amount for a USD price
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: currencyFrom
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: currencyTo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estimated price
 */
router.get('/estimate', paymentValidator.estimateValidator, validate, paymentController.getEstimatedPrice);

export default router;
