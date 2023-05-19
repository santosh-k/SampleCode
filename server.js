require("express-async-errors");
/* express-async-errors npm used to handle/catch api pipe line errors
By using this npm we do not need to put try catch bloack in every single api
*/
const App = require("./app");
const config = require("config");
const morgan = require("morgan");
const logger = require("./helpers/logger");
const ErrorHandler = require("./helpers/error");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileupload = require("express-fileupload");
global.logger = logger;
global.ErrorHandler = ErrorHandler;
const { accessHeaderMiddleware } = require("./middlewares/accessHeader");
const {
  apiErrorHandler,
  pageNotFound,
} = require("./middlewares/error-handler");

const { DefaultController } = require("./controllers/default.controller");
const { AdminUserController } = require("./controllers/admin/user.controller");
const { VendorController } = require("./controllers/admin/vendor.controller");
const {
  VendorEnquiryController,
} = require("./controllers/admin/vendorEnquiry.controller");
const {
  VendorRequestController,
} = require("./controllers/admin/vendorRequest.controller");
const {
  FrontLoginController,
} = require("./controllers/front/login.controller");
const {
  FrontProfileController,
} = require("./controllers/front/profile.controller");
const app = new App({
  port: config.PORT || 3005,
  middleWares: [
    accessHeaderMiddleware,
    morgan("dev", { skip: avoid }),
    express.json(),
    cors(),
    express.urlencoded({ extended: true }),
    fileupload(),
  ],
  controllers: [
    new DefaultController(),
    new AdminUserController(),
    new FrontLoginController(),
    new FrontProfileController(),
    new VendorController(),
    new VendorEnquiryController(),
    new VendorRequestController(),
  ],
  errorHandlers: [pageNotFound, apiErrorHandler],
});

process.on("uncaughtException", (err) => {
  logger.error(err, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    {
      promise,
      reason,
    },
    "unhandledRejection"
  );
  process.exit(1);
});




process.on("SIGINT", gracefulStopServer);
process.on("SIGTERM", gracefulStopServer);

app.listen()



function gracefulStopServer() {
  // Wait 10 secs for existing connection to close and then exit.
  setTimeout(() => {
    logger.info("Shutting down server..........");
    mongoose.connection.close(() => {
      logger.info(
        "Mongoose default connection disconnected through app termination"
      );
      process.exit(0);
    });
  });
}

function avoid(req, res) {
  return res.statusCode === 304;
}

