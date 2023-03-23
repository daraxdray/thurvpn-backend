const Feedback = require("../model/feedback");
const User = require("../model/users");
const emailSender = require("../services/mail_service");



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


  exports.sendReportToMail = async (req, res) => {
  const { subject, to, body } = req.body;

  try {
    if (!body || !subject || to == null) {
      let msg =
        (!body ? "Body" : "") +
        (!subject ? ", Subject" : "") +
        (!to ? ", Email" : "");
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Missing or Invalid parameter(s): " + msg,
        });
    }

    const mailer = new emailSender();

    let sent = await mailer.sendMailTo(
      null,
      to,
      subject,
      body
    );

    //if feedback is successfully created or updated
    if (sent) {
      
      return res
        .status(200)
        .json({
          data: sent,
          status: true,
          message: "Mail submitted.",
        });
    }
    return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "Unable to send mail",
      });
  } catch (error) {
   return failedResponseHandler(error, res);
  }}

