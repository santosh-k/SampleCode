const mongoose = require("mongoose");
const express = require("express");
const { vendorService } = require("../../services/admin/vendor.service");
const {
  vendorFormValidation,
  vendorLoginValidation,
} = require("../../models/vendor.model");
const { adminValidateToken } = require("../../middlewares/adminAuthMiddleware");
const { authService } = require("../../services/admin/vendor.service");
const c = require("config");
class VendorController {
  constructor() {
    this.path = "/admin/vendor";
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/signup", this.signup);
    this.router.post("/getUser", this.getUser);
    this.router.post("/login", this.login);
    this.router.post(
      "/update-vendor-info",
      adminValidateToken,
      this.updateVendorInfo
    );
    this.router.post("/vendorDetails/:id", this.vendorDetails);
    this.router.post("/list", this.list);
    this.router.post("/delete", this.deleteRecord);
    this.router.post("/change_status", this.changeStatus);
    this.router.get("/details/:id", this.details);
    this.router.post("/getUserId", this.getUserId);
    this.router.post("/bulk_record_update", this.bulkRecordUpdate);
    this.router.get("/get_vendor_list", this.getVendorList);
  }

  async signup(req, res) {
    req.body.step = "stepZero";
   
    const { error } = vendorFormValidation(req.body);
    
    if (error) {
      // console.log("andar");
      throw new ErrorHandler(400, error.details[0].message);
    }
    const data = await vendorService.signup(req);
    return res.status(200).json({
      status: "success",
      message: "Vendor data saved.",
      data: data,
    });
  }
  async getUser(req, res) {
    const data = await vendorService.getUser(req);
    if (!data) throw new ErrorHandler(400, "email not found");
    return res.status(200).json({
      status: "success",
      message: "data found",
      data: data,
    });
  }
  async vendorDetails(req, res) {
    let { data } = req.body;
    data.mobile = +data.mobile;
    let step = data.step;
    console.log("in vendor deatails",data)
    const { error } = vendorFormValidation(data);

    
    if (error) {
      console.log("error bhai",error)
      throw new ErrorHandler(400, error.details[0].message);
    }

    req.body.data.step = step;
    const result = await vendorService.vendorDetails(req);
    // return res.status(200).json({
    // result:result,
    // message:error.details[0].message});
    return res.status(200).json(result)
  }
  async getUserId(req, res) {
    const data = await vendorService.getUserId(req);
    return res.status(200).json({
      status: "success",
      message: "data found",
      data: data,
    });
  }
  async login(req, res) {
    let { data } = req.body;
    const { error } = vendorLoginValidation(data);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    const result = await vendorService.login(data);

    return res.status(200).json(result);
  }
  async updateWrongAttPass(req, res) {
    const data = await vendorService.updateWrongAttPass(req);
    return res.status(200).json({
      status: "success",
      message: "data found",
      data: data,
    });
  }
  async updateVendorInfo(req, res) {
    const { error } = vendorLoginValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    const data = await vendorService.updateVendorInfo(req);
    return res.status(200).json(data);
  }

  async list(req, res) {
    const result = await vendorService.list(req);
    return res.status(200).json({
      status: "success",
      message: "Vendor list is found successfully.",
      data: result,
    });
  }

  async details(req, res) {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler(400, "Invalid id");
    }
    const result = await vendorService.getDetails(id);
    return res.status(200).json({
      status: "success",
      message: "Vendor details is found",
      data: result,
    });
  }

  async deleteRecord(req, res) {
    let { id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler(400, "Please enter valid seller Id.");
    }
    let result = await vendorService.deleteRecord(req);
    return res.status(200).json({
      status: "success",
      message: result,
      data: [],
    });
  }

  async changeStatus(req, res) {
    let { id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler(400, "Invalid id");
    }
    let result = await vendorService.changeStatus(req);
    return res.status(200).json({
      status: "success",
      message: result,
      data: [],
    });
  }

  async bulkRecordUpdate(req, res) {
    let result = await vendorService.bulkRecordUpdate(req);
    return res.status(200).json({
      status: "success",
      message: result,
      data: [],
    });
  }

  async getVendorList(req, res) {
    let result = await vendorService.get_vendor_list(req);
    return res.status(200).json({
      status: "success",
      message: "Successfully fetched.",
      data: result,
    });
  }
}

exports.VendorController = VendorController;
