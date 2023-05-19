const mongoose = require("mongoose");
const Joi = require("joi");
const { date } = require("joi");
Joi.Objectid = require("joi-objectid")(Joi);
const ObjectId = mongoose.Types.ObjectId;
const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
		default: ""
	},
	mobile: {
		type: String,

	},
	socialId: {
		type: String,
		default: ""
	},
	modeOfSignUp: {
		type: String,
		default: ""
	},
	email: {
		type: String,

	},
	password: {
		type: String
	},
	otp: {
		type: Number
	},
	isVerifiedEmail: {
		type: Boolean,
		default: false
	},
	isVerifiedMobile: {
		type: Boolean,
		default: false
	},
	status: {
		type: Boolean,
		default: true
	},
	otpTime: {
		type: Date,
		default: Date.now
	},
	language_id: {
		type: String
	},
	language_code: {
		type: String
	},
	countryCode: {
		type: String,
		default: +91
	},
	ip_address: {
		type: String
	},
	device_id: {
		type: String
	},
	image: {
		type: String
	},
	isDeleted: {
		type: Number,
		default: 0
	}
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

function addUserValidation(data) {
	const schema = Joi.object({

		name: Joi.string().required(),
		mobile: Joi.string().required().label("Mobile number"),
		countryCode: Joi.string().required(),
		email: Joi.string().email().required(),
		ip_address: Joi.string().optional(),
		device_id: Joi.string().optional(),
		otp: Joi.number().required(),
		password: Joi.string().min(6).max(15).required(),
	});
	return schema.validate(data);
}

function addUserFrontValidation(data) {
	const schema = Joi.object({
		mobile: Joi.string().required().label("Mobile number"),
		email: Joi.string().email().optional(),
	});
	return schema.validate(data);
}

function adminUserValidation(data) {
	const schema = Joi.object({
		image: Joi.optional(),
		firstName: Joi.string().required(),
		lastName: Joi.optional(),
		
		mobile: Joi.string().required().label("Mobile number"),
		password: Joi.optional(),
		confirmPassword: Joi.optional(),
		countryCode: Joi.optional(),
		email: Joi.string().email().required(),
		dob: Joi.optional(),
		gender: Joi.optional()

	});
	return schema.validate(data);
}

function editUserFrontValidation(data) {
	const schema = Joi.object({
		name: Joi.string().required(),
		image: Joi.string().optional(),
		mobile: Joi.string().required().label("Mobile number"),
		countryCode: Joi.string().required(),
		email: Joi.string().email().required(),
	});
	return schema.validate(data);
}

function loginPassValidation(data) {
	const schema = Joi.object({
		email: Joi.required(),
		password: Joi.string().min(6).max(15).optional(),

		ip_address: Joi.string().optional(),
		device_id: Joi.string().optional(),
	});
	return schema.validate(data);
}

function loginOtpValidation(data) {
	const schema = Joi.object({
		mobile: Joi.required(),
		countryCode: Joi.string().required(),
	})
	return schema.validate(data);
}

function forgetPasswordValidation(data) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
	});
	return schema.validate(data);
}

function changePasswordValidation(data) {
	const schema = Joi.object({

		oldPassword: Joi.string().min(6).max(15).required(),
		newPassword: Joi.string().min(6).max(15).required()
	});
	return schema.validate(data);
}
function changeResetPasswordValidation(data) {
	const schema = Joi.object({
		email: Joi.string(),
		mobile: Joi.string(),
		countryCode: Joi.string().when('mobile', { 'is': 'avalue', then: Joi.string().required() }),
		newPassword: Joi.string().min(6).max(15).required()
	}).or('email', 'mobile')
	return schema.validate(data);
}

function resetPasswordValidation(data) {
	const schema = Joi.object({
		email: Joi.string().required(),
	});
	return schema.validate(data);
}

function resetMobileValidation(data) {
	const schema = Joi.object({
		mobile: Joi.string().required(),
		countryCode: Joi.string().required(),


	})
	return schema.validate(data);
}

function resetEmailValidation(data) {
	const schema = Joi.object({
		email: Joi.string().required(),
	})
	return schema.validate(data);
}

function verifyRegistrationValidation(data) {
	const schema = Joi.object({
		mobile: Joi.string().required(),
		countryCode: Joi.string().required(),

		ip_address: Joi.string().optional(),
		device_id: Joi.string().optional(),
		otp: Joi.number().required(),
	});
	return schema.validate(data);
}
function verifyEmailOtpValidation(data) {
	const schema = Joi.object({
		email: Joi.string().required(),
		ip_address: Joi.string().optional(),
		device_id: Joi.string().optional(),
		otp: Joi.number().required(),
	});
	return schema.validate(data);
}
function verifyMobileOtpValidation(data) {
	const schema = Joi.object({
		mobile: Joi.string().required(),
		ip_address: Joi.string().optional(),
		device_id: Joi.string().optional(),
		otp: Joi.number().required(),
	});
	return schema.validate(data);
}

function resendOtpValidation(data) {
	const schema = Joi.object({

		mobile: Joi.string().required(),
		countryCode: Joi.string().required(),
		email: Joi.string().optional()
	});
	return schema.validate(data);
}

function addSocialSignUpUserValidation(data) {
	const schema = Joi.object({

		name: Joi.string().required(),
		mobile: Joi.string().required().label("Mobile number"),
		countryCode: Joi.string().required(),
		email: Joi.string().email().required(),
        socialId: Joi.string().required(),
		ip_address: Joi.string().optional(),
		device_id: Joi.string().optional(),
		otp: Joi.number().required(),
		modeOfSignUp: Joi.string().required().label("Mode of SignUp"),
		image: Joi.optional(),
	});
	return schema.validate(data);
}

function addSocialSignInUserValidation(data) {
	const schema = Joi.object({
        socialId: Joi.string().required().label("Social Id"),
	});
	return schema.validate(data);
}

module.exports = {
	User,
	addUserValidation,
	addSocialSignUpUserValidation,
	addSocialSignInUserValidation,
	addUserFrontValidation,
	loginPassValidation,
	loginOtpValidation,
	forgetPasswordValidation,
	changePasswordValidation,
	resetPasswordValidation,
	resetMobileValidation,
	adminUserValidation,
	editUserFrontValidation,
	verifyRegistrationValidation,
	resetEmailValidation,
	verifyEmailOtpValidation,
	verifyMobileOtpValidation,
	resendOtpValidation,
	changeResetPasswordValidation
}