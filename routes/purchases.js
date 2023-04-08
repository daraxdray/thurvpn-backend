const express = require('express');
const router = express.Router();
const {authMiddleware,authAdmin} = require('../middleware/authentication')
const {createPurchase,getPurchaseById,getPurchaseByUserId,getAllPurchases,createStripeSheet, deletePurchase} = require('../controllers/purchases')



router.route('/create').post(createPurchase)
router.route('/get/:purchaseId').get(getPurchaseById)
router.route('/get-all').get(getAllPurchases)
router.route('/get-user-purchase/:userId').get(getPurchaseByUserId)


router.route('/create-sheet').post(createStripeSheet)
router.route("/delete/:id").delete(authAdmin, deletePurchase);


module.exports = router;