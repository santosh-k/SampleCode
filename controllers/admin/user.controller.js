const mongoose = require("mongoose");
const express = require("express");
const { adminValidateToken } = require('../../middlewares/adminAuthMiddleware');
const { userService } = require('../../services/admin/user.service');

class AdminUserController {

    constructor() {
        this.path = "/admin/user";
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.post("/list", adminValidateToken, this.list);
        this.router.get("/userListForCoupon",this.userListForCoupon)
        this.router.post("/add", adminValidateToken, this.add);
        this.router.all("/edit/:id", adminValidateToken, this.edit);
        this.router.get("/details/:id", adminValidateToken, this.details)
        this.router.post("/change_status", adminValidateToken, this.changeStatus);
        this.router.post("/delete", adminValidateToken, this.deleteRecord);
        this.router.post("/bulk_record_update", adminValidateToken, this.bulkRecordUpdate);
        this.router.post("/getUserData", adminValidateToken, this.getUserData);

    }

    async list(req, res) {
        const result = await userService.list(req);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch records",
            data: result
        });
    }
    async getUserData(req, res) {
        const result = await userService.getUserData(req);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch user name",
            data: result
        });
    }
    async userListForCoupon(req, res) {
        const result = await userService.userListForCoupon(req);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch records",
            data: result
        });
    }
    async add(req, res) {
        const result = await userService.add(req);
        return res.status(200).json({
            status: "success",
            message: "Successfully save record.",
            data: result
        });
    }

    async details(req, res) {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        const result = await userService.getDetails(id);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch record",
            data: result
        });
    }

    async edit(req, res) {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        if (req.method == "POST") {
            const result = await userService.saveEdit(req);
            return res.status(200).json({
                status: "success",
                message: "Successfully update record",
                data: result
            });
        } else {
            const result = await userService.getDetails(id);
            return res.status(200).json({
                status: "success",
                message: "Successfully fetch record",
                data: result
            });
        }
    }

    async bulkRecordUpdate(req, res) {
        let result = await userService.bulkRecordUpdate(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }

    async changeStatus(req, res) {
        let { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        let result = await userService.changeStatus(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }

    async deleteRecord(req, res) {
        let { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        let result = await userService.deleteRecord(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        });
    }
}

exports.AdminUserController = AdminUserController;