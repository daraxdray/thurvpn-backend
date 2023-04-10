const Plan = require("../model/plans");

exports.createPlan = async (req, res) => {
  try {
    const { title, description, price, duration } = req.body;
    if (!title || !description || !price || !duration || !iapCode) {
      return res.status(400).json({
        message: `Provide a valid ${
          !title
            ? "Title, "
            : !description
            ? "Description, "
            : !price
            ? "Price, "
            : !duration
            ? "Duration, "
            : !iapCode
            ? "IAP Code, "
            : ""
        } field.`,
        data: [],
        status: false,
      });
    }

    const plan = await Plan.create({
      ...req.body,
    });
    if (!plan) {
      return res.status(400).json({
        message: "Unable to create plan, please try again.",
        data: [],
        status: false,
      });
    }

    return res.status(200).json({
      message: "Plan created successfully",
      data: plan,
      status: false,
    });
  } catch (error) {
    failedResponseHandler(error, res);
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        data: [],
        message: "Invalid id provided for plan",
        status: false,
      });
    }

    const plan = await Plan.findOne({ _id: planId });
    if (!plan) {
      return res.status(400).json({
        message: "Unable to create plan, please try again.",
        data: [],
        status: false,
      });
    }

    return res.status(200).json({
      message: "Plan found successfully",
      data: plan,
      status: false,
    });
  } catch (error) {
    failedResponseHandler(error, res);
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        data: [],
        message: "Invalid id provided for plan",
        status: false,
      });
    }

    const plan = await Plan.findByIdAndUpdate(
      planId,
      {
        ...req.body,
      },
      { new: true }
    );
    if (!plan) {
      return res.status(400).json({
        message: "Unable to create plan, please try again.",
        data: [],
        status: false,
      });
    }

    return res.status(200).json({
      message: "Plan updated successfully",
      data: plan,
      status: false,
    });
  } catch (error) {
    failedResponseHandler(error, res);
  }
};

exports.getAllPlan = async (req, res) => {
  try {
    const plans = await Plan.find({});

    if (![]) {
      return res
        .status(404)
        .json({ message: "No plan found!", data: null, status: false });
    }

    return res.status(200).json({
      data: { count: plans.length, plans },
      status: true,
      message: "Plans listed",
    });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PLan.deleteOne({ _id: id });
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
