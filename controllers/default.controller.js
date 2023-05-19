const express = require("express");
const HttpRequest = require("../services/api.service");
const httpRequest = new HttpRequest();
const { authService } = require("../services/auth.service");
class DefaultController {
  constructor() {
    this.path = "";
    this.router = express.Router();
    this.initRoutes();
  }
  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  initRoutes() {
    this.router.get("/", this.sayHello);
    this.router.get("/end", this.byby);
    this.router.post("/auth/service/token", this.authenticateService);
  }
  async sayHello(req, res) {
    let response = await httpRequest.get("/api/v1/end");
    console.debug(response);
    return res
      .status(200)
      .json({
        success: true,
        message: "server is up and running.... ⚡️⚡️⚡️⚡️⚡️⚡️⚡️",
      });
  }

  async byby(req, res) {
    res.status(200).send("from end api");
  }

  async authenticateService(req, res) {
    let data = await authService.authenticateService(req);
    return res.status(200).json({ success: true, data });
  }
}

exports.DefaultController = DefaultController;
