const express = require('express');
const router = express.Router();
const {authMiddleware,authAdmin} = require('../middleware/authentication')
const {createPurchase,getPurchaseById,getPurchaseByUserId,getAllPurchases} = require('../controllers/purchases')



router.route('/create').post(authMiddleware,createPurchase)
router.route('/get/:purchaseId').get(getPurchaseById)
router.route('/get-all').get(authAdmin,getAllPurchases)
router.route('/get-user-purchase/:userId').get(getPurchaseByUserId)


module.exports = router;