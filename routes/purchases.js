const express = require('express');
const router = express.Router();
const {authorization, authMiddleware,authAdmin} = require('../middleware/authentication')
const {createPurchase,getPurchaseById,getPurchaseByUserId,getAllPurchases,createStripeSheet} = require('../controllers/purchases')



router.route('/create').post(createPurchase)
router.route('/get/:purchaseId').get(getPurchaseById)
router.route('/get-all').get(authorization, authAdmin, getAllPurchases)
router.route('/get-user-purchase/:userId').get(getPurchaseByUserId)


router.route('/create-sheet').post(createStripeSheet)

module.exports = router;