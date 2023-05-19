const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Joi = require("joi");
Joi.objectid = require("joi-objectid")(Joi);

const vendorShopSchema = new mongoose.Schema({
	vendorId: {
		type: ObjectId,
		required: true
	},
	shopName: {
		type: String
	},
	shopAddress: {
		type: String
	},
	shopCity: {
		type: String
	},
	shopEmailId: {
		type: String
	},
	shopAddress: {
		type: String
	},
	shopState: {
		type: String
	},
	shopCity: {
		type: String
	},
	shopCountry: {
		type: String
	},
	shopCountryCode: {
		type: String
	},
	wareHouseAddress: {
		type: String
	},
    lat: {
        type: String
    },
    log: {
        type: String
    },
	shopImage: {
		type: String
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

const VendorShop = mongoose.model("VendorShop", vendorShopSchema);
module.exports = {
	VendorShop
}