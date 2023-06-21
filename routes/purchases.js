const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const {authorization, authMiddleware,authAdmin} = require('../middleware/authentication')
const {createPurchase,getPurchaseById,getPurchaseByUserId,getAllPurchases,createStripeSheet} = require('../controllers/purchases')
=======
const {authMiddleware,authAdmin} = require('../middleware/authentication')
const {createPurchase,getPurchaseById,getPurchaseByUserId,getAllPurchases,createStripeSheet, deletePurchase} = require('../controllers/purchases')
>>>>>>> 0b42c66cfe7c11627cdd12c9ea882c501118404a



router.route('/create').post(createPurchase)
router.route('/get/:purchaseId').get(getPurchaseById)
router.route('/get-all').get(getAllPurchases)
router.route('/get-user-purchase/:userId').get(getPurchaseByUserId)


router.route('/create-sheet').post(createStripeSheet)
router.route("/delete/:id").delete(authAdmin, deletePurchase);


module.exports = router;