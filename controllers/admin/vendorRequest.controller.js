const mongoose = require("mongoose");
const express = require("express");
const { vendorRequestService } = require('../../services/admin/vendorRequest.service');

class VendorRequestController {

    constructor() {
        this.path = "/admin/vendorrequest";
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.post("/add_request", this.addRequest);
         this.router.post("/list", this.list);
         this.router.post("/delete", this.deleteRecord);
         this.router.get("/details/:id", this.details);
         this.router.post("/edit_details/:id",this.editDetails)
         this.router.post("/change_vendor_request_status", this.changeVendorRequestStatus);
         this.router.post("/bulk_record_update", this.bulkRecordUpdate)
    }

    async addRequest(req, res) {
        const result = await vendorRequestService.addRequestData(req);
        return res.status(200).json({
            status: "success",
            message: "Seller Request has been submitted successfully.",
            data: result
        });
    }


    async list(req, res) {
        const result = await vendorRequestService.list(req);
        return res.status(200).json({
            status: "success",
            message: "Vendor Request is found successfully.",
            data: result
        });
    }

    async deleteRecord(req, res) {
        let { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Please enter valid Id.");
        }
        let result = await vendorRequestService.deleteRecord(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }

    async details(req, res) {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid Vendor Id");
        }
        const result = await vendorRequestService.getDetails(id);
        return res.status(200).json({
            status: "success",
            message: "Vendor Details is found.",
            data: result
        });
    }
  

    async editDetails(req,res) {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid Vendor Id");
        }
        const result = await vendorRequestService.editDetails(id);
        return res.status(200).json({
            status: "success",
            message: "Details have been updated",
            data: result
        });
    }
    async changeVendorRequestStatus(req, res) {
        let { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Please enter valid Id.");
        }
        let result = await vendorRequestService.changeVendorRequestStatus(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }

    async bulkRecordUpdate(req, res) {
        let result = await vendorRequestService.bulkRecordUpdate(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }


}

exports.VendorRequestController = VendorRequestController;