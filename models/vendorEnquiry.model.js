const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectid = require("joi-objectid")(Joi);

const vendorEnquirySchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String
	},
	mobile: {
		type: String,
		required: true
	},
	countryCode: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	ipAddress: {
		type: String,
		required: true
	},
    enquiryStatus: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Accepted", "Rejected"]
    },
	status: {
		type: Boolean,
		default: true
	},
	isDeleted: {
		type: Number,
		default: 0
	},
}, { timestamps: true });

const VendorEnquiry = mongoose.model("VendorEnquiry", vendorEnquirySchema);

function addVendorEnquiryFrontValidation(data) {
	const schema = Joi.object({
		firstName: Joi.string().required(),
		lastName: Joi.string().allow("").optional(),
		countryCode: Joi.string().required(),
		mobile: Joi.number().integer().min(1000000000).max(9999999999).required(),
		email: Joi.string().email().required(),
		ipAddress: Joi.string().allow(""),
		password: Joi.string().allow("").required()
	});
	return schema.validate(data);
}

module.exports = {
	VendorEnquiry,
	addVendorEnquiryFrontValidation
}