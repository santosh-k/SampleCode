const mongoose = require("mongoose");
const express = require("express");
const { frontValidateToken } = require('../../middlewares/frontAuthMiddleware');
const { userService } = require('../../services/front/user.service');

class FrontProfileController {

    constructor() {
        this.path = "/front/user";
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.all("/profile", frontValidateToken, this.profile);
        this.router.post("/change-password", frontValidateToken, this.changePassword);
        this.router.all("/address", frontValidateToken, this.address);
        this.router.post("/get-address", frontValidateToken, this.getEditDetails);
        this.router.put("/default-address", frontValidateToken, this.defaultAddress);
        this.router.post("/mobile-otp", frontValidateToken, this.mobileSendOtp);
        this.router.post("/email-otp", frontValidateToken, this.emailSendOtp);
        this.router.post("/verify-email", frontValidateToken, this.verifyEmailOtp);
        this.router.post("/verify-mobile", frontValidateToken, this.verifyMobileOtp);
    }



    async mobileSendOtp(req, res) {

        const result = await userService.profileMobileOtp(req);
        return res.status(200).json({
            status: "success",
            message: "Otp is sent to youre mobile, Please verify to complete the registration process.",
            data: result
        })
    }

    async emailSendOtp(req, res) {

        const result = await userService.emailOtp(req);
        return res.status(200).json({
            status: "success",
            message: "Otp is sent to youre Email, Please verify to complete the registration process.",
            data: result
        })
    }

    async verifyEmailOtp(req, res) {
        const result = await userService.verifyEmail(req);
        return res.status(200).json({
            status: "success",
            message: "OTP VERIFIED SUCCESSFULLY",
            data: result
        })

    }

    async verifyMobileOtp(req, res) {
        const result = await userService.verifyMobile(req);
        return res.status(200).json({
            status: "success",
            message: "OTP VERIFIED SUCCESSFULLY",
            data: result
        })

    }

    async profile(req, res) {
        let { language_id, lang_code } = req.headers;
        let id = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        if (req.method == "PUT") {
            const updateData = await userService.updateDetails(req);
            return res.status(200).json({
                status: "success",
                message: "Successfully update record",
                data: updateData
            });
        } else if (req.method == 'GET') {
            const result = await userService.getDetails(req);
            return res.status(200).json({
                status: "success",
                message: "Successfully fetch record",
                data: result
            });
        } else {
            throw new ErrorHandler(400, "This method is not valid");
        }
    }

    async changePassword(req, res) {
        let id = req.user._id;
       
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        const result = await userService.changePassword(req);
        return res.status(200).json({
            status: "success",
            message: result,
            data: []
        })
    }

    async address(req, res) {
        let { language_id, lang_code } = req.headers;
        let id = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }

        if (req.method == "POST") {
            const result = await userService.addAddress(req);
            return res.status(200).json({
                status: "success",
                message: "User address created.",
                data: result
            })
        }
        else if (req.method == "GET") {
            const result = await userService.getAddress(req);
            return res.status(200).json({
                status: "success",
                message: "Fetch all user address",
                data: result
            })
        }

        else if (req.method == "DELETE") {
            const id = req.query.id;
            const result = await userService.deleteAddress(id);
            return res.status(200).json({
                status: "success",
                message: "User address deleted",
                data: []
            })
        }

        else if (req.method == "PUT") {
            const result = await userService.editAddress(req);
            return res.status(200).json({
                status: "success",
                message: "USer address updated",
                data: result
            })
        }
        else throw new ErrorHandler(400, "Something went wrong");
    }

    async defaultAddress(req, res) {
        let { language_id, lang_code } = req.headers;
        let id = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorHandler(400, "Invalid id");
        }
        const result = await userService.defaultAddress(req);
        return res.status(200).json({
            status: "success",
            message: "Your address set as default address",
            data: result
        })
    }

    async getEditDetails(req,res){
        let { language_id, lang_code } = req.headers;
        const result = await userService.getAddDetails(req);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch record",
            data: result
        });

    }
}

exports.FrontProfileController = FrontProfileController;