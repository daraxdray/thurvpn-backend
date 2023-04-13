const Purchase = require("../model/purchases");
const User = require("../model/users");
const Plan = require("../model/plans");
// const stripe = require('stripe')('sk_test_...');
const PaymentService = require("../services/payment_service");
const handleStripeWebhookEvent = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);
      // Handle the payment intent success
      break;
    case "payment_method.attached":
      const paymentMethod = event.data.object;
      console.log(`PaymentMethod ${paymentMethod.id} attached to customer.`);
      // Handle the payment method attachment
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("OK");
};

exports.createStripeSheet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      let msg = "Amount ";
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Missing or Invalid parameter(s): " + msg,
        });
    }
    
  
    const sheet = await PaymentService.getSheet(amount);
    res.json({ msg: "Sheet created!", data: sheet, status: true });
  } catch (e) {
    return failedResponseHandler(e, res);
  }
};

exports.createPurchase = async (req, res) => {
  const { userId, planId, paymentStatus } = req.body;

  try {
    if (!userId || !planId || paymentStatus == null) {
      let msg =
        (!userId ? "User id" : "") +
        (!planId ? ", Plan id" : "") +
        (!paymentStatus ? ", Payment status" : "");
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Missing or Invalid parameter(s): " + msg,
        });
    }
    const user = await User.findOne({_id:userId});
    
    if(!user){
      return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "User does not exist",
      });
    }
    const plan = await Plan.findOne({_id:planId});
    
    if(!plan){
      return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "Plan does not exist",
      });
    }


    const purchaseExist = await Purchase.findOne({ user_id: userId });
    const regDate = new Date();
    const expire = new Date(regDate.getFullYear(),regDate.getMonth()+plan.duration, regDate.getDate());
    console.log(expire);
    let purchase = null;
    //check if user alreay subscribed and update subscription
    if (purchaseExist) {
      const now = Date.now();

      purchase = await Purchase.findByIdAndUpdate(
        { _id: purchaseExist.id },
        { plan_id: planId, active: 
          paymentStatus, updated_at:  now,
          expire_at:expire
        },
        { new: true }
      );
    } else {
      purchase = await Purchase.create({
        user_id: userId,
        plan_id: planId,
        active: paymentStatus,
        expire_at: expire
      });
    }
    //if purchase is successfully created or updated
    if (purchase) {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { isPremium: paymentStatus, activePlan: purchase.id }
      );
      return res
        .status(200)
        .json({
          data: purchase,
          status: true,
          message: "Purchase transaction completed.",
        });
    }
    return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "Unable to create purchase transaction",
      });
  } catch (error) {
    failedResponseHandler(error, res);
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId) {
      return res
        .status(400)
        .json({ message: "Missing Purchase ID", status: false, data: [] });
    }

    let purchase = await Purchase.findOne({ _id: purchaseId });

    if (!purchase) {
      return res
        .status(400)
        .json({
          message: `No purchase with the provided id`,
          status: false,
          data: [],
        });
    }

    purchase = purchase.toObject({ virtuals: true });
    const daysLeft = purchase.plan_id.duration - purchase.daysCount;
    return res
      .status(200)
      .json({
        message: "Purchase found",
        status: true,
        data: { ...purchase, daysLeft: daysLeft },
      });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unable to get user data", status: false, data: [] });
  }
};

exports.getPurchaseByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing User ID", status: false, data: [] });
    }

    let purchase = await Purchase.findOne({ user_id: userId }).populate(
      "plan_id"
    );

    if (!purchase) {
      return res
        .status(400)
        .json({
          message: `No purchase with the provided user id`,
          status: false,
          data: [],
        });
    }
    purchase = purchase.toObject({ virtuals: true });
    const daysLeft = purchase.plan_id.duration - purchase.daysCount;
    return res
      .status(200)
      .json({
        message: "Purchase found",
        status: true,
        data: { ...purchase, daysLeft: daysLeft },
      });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unable to get user data", status: false, data: [] });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
    .populate('plan_id')  // populate the 'plan' field using its reference
    .populate('user_id');

    if (![]) {
      return res
        .status(404)
        .json({ message: "No purchase found!", data: null, status: false });
    }
  
    return res
      .status(200)
      .json({
        data: { count: purchases.length, purchases},
        status: true,
        message: "Purchase listed",
      });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};


exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Purchase.deleteOne({ _id: id });
    if (deleted && deleted.deletedCount != 0) {
      return res.status(200).json({
        data: deleted,
        status: true,
        message: "Plan cleared from documents",
      });
    }

    return res.status(400).json({
      data: id + ":::",
      status: false,
      message: "Unable to delete plan",
    });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};
