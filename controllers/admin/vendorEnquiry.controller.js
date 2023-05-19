const mongoose = require("mongoose");
const express = require("express");
const { vendorEnquiryService } = require('../../services/admin/vendorEnquiry.service');

class VendorEnquiryController {

    constructor() {
        this.path = "/admin/vendorenquiry";
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.post("/add-enquiry", this.addEnquiry);
        this.router.post("/list", this.list);
        this.router.post("/delete", this.deleteRecord);
        this.router.post("/change_enquiry_status", this.changeEnquiryStatus);
        this.router.post("/bulk_record_update", this.bulkRecordUpdate)
    }

    async addEnquiry(req, res) {
        const result = await vendorEnquiryService.submitEnquiryData(req);
        return res.status(200).json({
            status: "success",
            message: "Enquiry has been submitted successfully.",
            data: result
        });
    }

    async list(req, res) {
        const result = await vendorEnquiryService.list(req);
        return res.status(200).json({
            status: "success",
            message: "Vendor list is found successfully.",
            data: result
        });
    }

    async deleteRecord(req, res) {
        let { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Please enter valid Id.");
        }
        let result = await vendorEnquiryService.deleteRecord(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }

    async changeEnquiryStatus(req, res) {
        let { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Please enter valid Id.");
        }
        let result = await vendorEnquiryService.changeEnquiryStatus(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }

    async bulkRecordUpdate(req, res) {
        let result = await vendorEnquiryService.bulkRecordUpdate(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }


}

exports.VendorEnquiryController = VendorEnquiryController;