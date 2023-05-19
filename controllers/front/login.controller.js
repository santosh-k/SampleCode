const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt")
const { User, addUserValidation, loginValidation,forgetPasswordValidation } = require("../../models/user.model")
const { userService } = require('../../services/front/user.service');
const { frontValidateToken } = require('../../middlewares/frontAuthMiddleware');
const ErrorHandler = require("../../helpers/error");
const {
    userOtp,
    addUserOtpValidation
} = require('../../models/userotp.model');

class FrontLoginController {

    constructor() {
        this.path = "/front/user";
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.post("/send_otp", this.sendOtp);
        this.router.post("/resend_otp", this.resendOtp);
        this.router.post("/login_pass", this.loginWithPassword);
        this.router.post("/login_mobile", this.loginWithOtp);
        this.router.post("/verify_registration", this.verifyRegistration);
        this.router.post("/forget-password", this.forgetPassword);
        this.router.post("/reset-email", this.resetEmail);
        this.router.post("/reset-mobile", this.resetMobile);
        this.router.post("/verify-resetemail", this.verifyResetEmail);
        this.router.post("/verify-resetmobile", this.verifyResetMobile);
        this.router.post("/reset-password", this.changeResetPassword);

        this.router.post("/signup", this.signUp);
        this.router.post("/auth_social_signup", this.socialSignUp);
        this.router.post("/auth_social_signin", this.socialSignIn);
    }



    async sendOtp(req, res) {

        const result = await userService.sendOtp(req);
        return res.status(200).json({
            status: "success",
            message: "Otp is sent to youre mobile, Please verify to complete the registration process.",
            data: result
        })
    }

    async verifyRegistration(req, res) {

        const token = await userService.verifyOtp(req);
        return res.status(200).json({
            status: "success",
            message: "Succesfully LoggedIn",
            data: { token }
        });
    }

    async resendOtp(req, res) {
        const result = await userService.resendOtp(req);
        return res.status(200).json({
            status: "success",
            message: "Otp resend successfully!",
            data: result
        });
    }

    async loginWithOtp(req, res) {
        const token = await userService.loginOtp(req);
        if (token) {
            res.status(200).json({
                status: "success",
                message: 'OTP succesfully Generated',
            });
        } else {
            return res.json({ success: false, isError: true, message: 'You have entered wrong mobile number' });
        }
    }

    async loginWithPassword(req, res) {
        const token = await userService.loginPassword(req);
        if (token) {
            res.status(200).json({
                status: "success",
                message: 'You are logged in successfully.',
                data: { token }
            });
        } else {
            return res.json({ success: false, isError: true, message: 'You have entered wrong mobile number or password.' });
        }


    }

    async forgetPassword(req, res) {
        const result = await userService.forgetPassword(req);
        return res.status(200).json({
            status: "success",
            message: "Successfully OTP send.",
            data: {
                otp: result.otp,
                id: result._id
            }
        })
    }

    async resetEmail(req, res) {
        const result = await userService.resetWithEmail(req);
        return res.status(200).json({
            status: "success",
            message: "OTP SUCCESFULLY GENERATED",
            data: result
        })
    }

    async resetMobile(req, res) {
        const result = await userService.resetWithMobile(req);
        return res.status(200).json({
            status: "success OTP send Succesfully",
            message: result,
            data: []
        })

    }

    async verifyResetEmail(req,res){
        const result = await userService.verifyEmailResetOtp(req);
        return res.status(200).json({
            status: "success",
            message: "OTP VERIFIED SUCCESFULLY",
            data: result
        })

    }
    async verifyResetMobile(req,res){
        const result = await userService.verifyMobileResetOtp(req);
        return res.status(200).json({
            status: "success",
            message: "OTP VERIFIED SUCCESFULLY",
            data: result
        })

    }

    async changeResetPassword(req, res) {

        const result = await userService.changeResetPass(req);
        return res.status(200).json({
            status: "Succesfully Changed password",
            message: result,
            data: []
        })
    }

    async signUp(req, res) {

        await userService.signUp(req)
        return res.status(200).json({
            status: "success",
            message: "Succesfull Signup",
            data: []
        })
    }

    async socialSignUp(req, res) {
        let result = await userService.socialSignUp(req);
        return res.status(200).json({
            status: "success",
            message: "Succesfull Signup",
            data: {
                token:result
            }
        })
    }

    async socialSignIn(req, res) {
        let result = await userService.socialSignIn(req);
        return res.status(200).json({
            status: "success",
            message: "Succesfull Signup",
            data: {
                token:result
            }
        })
    }

}


exports.FrontLoginController = FrontLoginController;

