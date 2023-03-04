const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authentication')
const {createPurchase,getPurchaseById,getPurchaseByUserId,getAllPurchases} = require('../controllers/purchases')



router.route('/create').post(authMiddleware,createPurchase)
router.route('/get/:purchaseId').get(authMiddleware,getPurchaseById)
router.route('/get-all').get(authMiddleware,getAllPurchases)
router.route('/get-user-purchase/:userId').get(authMiddleware,getPurchaseByUserId)


module.exports = router;