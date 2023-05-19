const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Joi = require("joi");
Joi.bjectid = require("joi-objectid")(Joi);

const userOtpSchema = new mongoose.Schema({
    mobile: {
        type: String,
    },
    email: {
        type: String,
    },
    countryCode: {
        type: String,
        default: "+91"
    },
    otp: {
        type: Number,
    },
    otpTime: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    isVerifiedMobile: {
        type: Boolean,
        default: false
    },
    isVerifiedEmail: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const userOtp = mongoose.model("userOtp", userOtpSchema);

function addUserOtpValidation(data) {
    const schema = Joi.object({
        countryCode: Joi.string().required(),
        mobile: Joi.string().required(),
    })
    return schema.validate(data);
}



module.exports = {
    userOtp,
    addUserOtpValidation
}