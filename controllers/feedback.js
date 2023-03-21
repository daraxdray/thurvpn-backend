const Feedback = require("../model/feedback");
const User = require("../model/users");




exports.createFeedback = async (req, res) => {
  const { userId, subject, email, description } = req.body;

  try {
    if (!description || !subject || email == null) {
      let msg =
        (!description ? "Description" : "") +
        (!subject ? ", Subject" : "") +
        (!email ? ", Email" : "");
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Missing or Invalid parameter(s): " + msg,
        });
    }

  
      feedback = await Feedback.create({
        userId: userId,
        subject: subject,
        email: email,
        description:description
      });
  
    //if feedback is successfully created or updated
    if (feedback) {
      
      return res
        .status(200)
        .json({
          data: feedback,
          status: true,
          message: "Feedback submitted completed.",
        });
    }
    return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "Unable to submit feedback",
      });
  } catch (error) {
   return failedResponseHandler(error, res);
  }}

