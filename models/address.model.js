const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Joi = require("joi");
Joi.objectid = require("joi-objectid")(Joi);

const userAddressSchema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true

    },
    mobile: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        default: "+91"
    },
    pinCode: {
        type: String,
        required: true
    },
    flat_House_no_Building_Company_Apartment: {
        type: String,
        required: true
    },
    area_Street_Sector_Village: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        default: ''
    },
    town_City: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address_Type: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        required: true
    },
    isDeleted: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Address = mongoose.model("address", userAddressSchema);

function addUserAddressValidation(data) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        mobile: Joi.string().required().label("Mobile number"),
        countryCode: Joi.string().required(),
        pinCode: Joi.string().required(),
        flat_House_no_Building_Company_Apartment: Joi.string().required(),
        area_Street_Sector_Village: Joi.string().required(),
        landmark: Joi.string().allow("").optional(),
        town_City: Joi.string().required(),
        state: Joi.string().required(),
        address_Type: Joi.string().allow("").optional(),
        isDefault: Joi.boolean().required()
    });
    return schema.validate(data);
}

function editUserAddressValidation(data) {
    const schema = Joi.object({
        id: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),

        mobile: Joi.string().required().label("Mobile number"),
        pinCode: Joi.string().required(),
        flat_House_no_Building_Company_Apartment: Joi.string().required(),
        area_Street_Sector_Village: Joi.string().required(),
        landmark: Joi.string().allow("").optional(),
        town_City: Joi.string().required(),
        state: Joi.string().required(),
        address_Type: Joi.string().allow("").optional(),
        isDefault: Joi.boolean().required()

    });
    return schema.validate(data);
}

function deleteUserAddressValidation(data) {
    const schema = Joi.object({
        id: Joi.string().required(),
    });
    return schema.validate(data);
}

function defaultAddressValidation(data) {
    const schema = Joi.object({
        id: Joi.string().required(),
    });
    return schema.validate(data);
}

function getAddressValidation(data) {
    const schema = Joi.object({
        id: Joi.string().required(),
    });
    return schema.validate(data);
}
module.exports = {
    Address,
    getAddressValidation,
    addUserAddressValidation,
    editUserAddressValidation,
    deleteUserAddressValidation,
    defaultAddressValidation
}