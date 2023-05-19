const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Joi = require("joi");
Joi.objectid = require("joi-objectid")(Joi);

const vendorRequestSchema = new mongoose.Schema({
    shopId : {
        tupe: ObjectId
    },
    firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String
	},
	mobile: {
		type: Number,
		required: true
	},
	countryCode: {
		type: String,
		required: true
	},
	email: {
		type: String,
	},
	password: {
		type: String,
	},
	ipAddress: {
		type: String,
	},
    country: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String 
    },
    zipCode: {
        type: Number
    },
    shopRegistered: {
        type: Boolean,
        default: false
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
    shopPhone: {
        type: Number
    },
    shopCountry: {
        type: String
    },
    shopCountryCode: {
        type: String
    },
    shopImage: {
         type: String
    },
    shopState: {
        type: String
    },
    shopZipCode: {
        type: Number
    },
    wareHouseAddress: {
        type: String
    },
    category: {
        type: Array
    },
    shippingType: {
        type: Array
    },
    gstNumber: {
        type: Number,
    },
    gstNumberPicture: {
        type: String,
    },
    panNumber: {
        type: Number
    },
    panNumberPicture: {
        type: String
    },
    vatNumber: {
        type: Number
    },
    vatNumberPicture: {
        type: String
    },
    bankName: {
        type: String,
    },
    bankAccountHolderName: {
        type: String
    },
    bankAccountNumber: {
        type: Number
    },
    bankChequeBookPicture: {
        type: String
    },
    bankIfscCode: {
        type: String
    },
    bankAddress: {
        type: String
    },
    bankCountry: {
        type: String
    },
    bankState: {
        type: String
    },  
    bankZipCode: {
        type: Number
    },
    requestStatus: {
        type: String,
        default: "NewRequest",
        enum: ["NewRequest", "Approved", "Rejected"]
    },
    totalProducts: {
        type: Number,
        default: 0
    },
    totalCategories: {
        type: Number
    },
    profilePicture: {
         type: String
    },
    rejectReason: {
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

const VendorRequest = mongoose.model("VendorRequest", vendorRequestSchema);
function addVendorRequestFrontValidation(data) {
	const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName:  Joi.string().required(),
        mobile: Joi.number().integer().min(1000000000).max(9999999999).required(),
        countryCode: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        ipAddress: Joi.string().required(),
	    country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        zipCode: Joi.string().required(),
        
        shopName: Joi.string().optional(),
        shopRegistered: Joi.boolean().required(),
        shopAddress: Joi.string().allow("").optional(),
        shopEmailId: Joi.string().allow("").optional(),
        shopPhone: Joi.number().optional(),
        shopCountry: Joi.string().optional(),
        shopCountryCode: Joi.string().optional(),
        shopState: Joi.string().optional(),
        shopZipCode: Joi.number().optional(),
        shopCity: Joi.string().optional(),
        shopImage: Joi.string().allow("").optional(),
        wareHouseAddress: Joi.string().allow("").optional(),
        
        category: Joi.array().optional(),
        shippingType: Joi.array().optional(),
        
        gstNumber: Joi.number().optional(),
        gstNumberPicture: Joi.string().allow("").optional(),
        panNumber: Joi.number().optional(),
        panNumberPicture: Joi.string().allow("").optional(),
        vatNumber: Joi.number().optional(),
        vatNumberPicture: Joi.string().allow("").optional(),
        
        bankName: Joi.string().required(),
        bankAccountHolderName: Joi.string().required(),
        bankAccountNumber: Joi.number().required(),
        bankChequeBookPicture: Joi.string().allow("").optional(),
        bankIfscCode: Joi.string().required(),
        requestStatus: Joi.string().required(),
        bankAddress: Joi.string().required(),
        bankCountry: Joi.string().required(),
        bankState: Joi.string().required(),
        bankZipCode: Joi.number().required(),
        profilePicture: Joi.string().allow("").optional(),

        rejectReason: Joi.string().optional()
	});
	return schema.validate(data);
}
module.exports = {
    addVendorRequestFrontValidation,
	VendorRequest
}