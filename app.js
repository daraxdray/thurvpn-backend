const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const connecDB = require("./db/connect");
const { authMiddleware, authAdmin } = require("./middleware/authentication");
const cors = require("cors");

//ROUTES
const indexRouter = require("./routes");
const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const vpnRouter = require("./routes/vpn");
const planRouter = require("./routes/plans");
const purchaseRouter = require("./routes/purchases");
const settingsRouter = require("./routes/settings");
const feedbackRouter = require("./routes/feedback");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "fronts"));
app.set("view engine", "jade");

//
var corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://admin.thurvpn.com"
  ],
  credentials: true,
  methods: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
};
app.use(cors(corsOptions))
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use(function (req, res, next) {
  if (req.headers["ssk"] == null || req.headers["ssk"] != process.env.SSK) {
    return res.json({
      data: [],
      status: false,
      message: "Please provide required credentials to use api."
    });
  }
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, ssk"

  );
  next();
});

app.use("/", indexRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api/vpn", vpnRouter);
app.use("/api/plans", planRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/feedback", feedbackRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  return res
    .status(404)
    .json({ status: false, message: "Resource not found", data: null });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
