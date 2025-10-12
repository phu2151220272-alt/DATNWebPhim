const express = require('express');
const router = express.Router();

const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

const controllerPayments = require('../controller/payments.controller');

router.post('/create', authUser, asyncHandler(controllerPayments.createPayment));
router.get('/check-payment-momo', asyncHandler(controllerPayments.checkPaymentMomo));
router.get('/check-payment-vnpay', asyncHandler(controllerPayments.checkPaymentVNPay));
router.get('/detail', asyncHandler(controllerPayments.getPaymentById));
router.get('/user', authUser, asyncHandler(controllerPayments.getPaymentByUserId));
router.get('/admin', asyncHandler(controllerPayments.getPaymentByAdmin));
router.post('/update-status', asyncHandler(controllerPayments.updatePaymentStatus));
router.post('/cancel-booking', authUser, asyncHandler(controllerPayments.cancelBooking));

module.exports = router;
