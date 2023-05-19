const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectid = require("joi-objectid")(Joi);
const contactInfoSchema = new mongoose.Schema({
  country: {
    type: "string",
  },
  state: {
    type: "string",
  },
  city: {
    type: "string",
  },
  zip: {
    type: "string",
  },
});

const businessInfoSchema = new mongoose.Schema({
  shopLogo: {
    type: "string",
  },
  authorizationImage:{
    type:"string"
  },
  sellCategory: {
    type: [mongoose.Schema.ObjectId],
  },
  categoryName: {
    type: Array,
  },
  residentialAddress: {
    type: "string",
  },
  residentialZipCode: {
    type: "string",
  },
  residentialCity: {
    type: "string",
  },
  residentialCountry: {
    type: "string",
  },
  residentialState: {
    type: "string",
  },
  shopName: {
    type: "string",
  },
});

const taxInfoSchema = new mongoose.Schema({
  type:{
  type:"string"
  },
  gst: {
    type: "string",
  },
  status:{
    type:Boolean
  },
  pancard: {
    type: "string",
  },
  registration: {
    type: "string",
  },
  doc: {
    type: "string",
  },
  loa:{
   type:"string",
  },
  shipping: {
    type: String,   
}
});

const bankInfoSchema = new mongoose.Schema({
  bankName: {
    type: "string",
  },
  accountHolderName: {
    type: "string",
  },
  accountNumber: {
    type: "string",
  },
  ifscCode: {
    type: "string",
  },
  cheque: { type: "string" },
});

const vendorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
      
    },
    

    email: {
      type: String,
      required: true,
      
    },
    password: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    enquiryStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Accepted", "Rejected"],
    },
    requestStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Waiting", "Accepted", "Rejected"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Number,
      default: 0,
    },
    isRejected: {
      type: Number,
      default: 0,
    },
    countryCode:{
    type:String,
    default:"+91"
    },
    wrongPasswordAtt: {
      type: Number,
      default: 0,
    },
    wrongPasswordAttTime: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    stepNumber: {
      type: Number,
      default: 1,
    },
    stepOne: {
      type: contactInfoSchema,
    },
    stepTwo: {
      type: businessInfoSchema,
    },
    stepThree: {
      type: taxInfoSchema,
    },
    stepFour: {
      type: bankInfoSchema,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

function vendorFormValidation(data) {
  
  let validationDataObj = {};
  if (data.step === "stepZero") {
    validationDataObj = {
      firstName: Joi.string().required(),
      lastName: Joi.string().allow("").optional(),
      mobile: Joi.number().integer().min(1000000000).max(9999999999).required(),
      
      email: Joi.string().email().required(),
      ipAddress: Joi.string().allow(""),
      password: Joi.string().allow("").required(),
    };
  }

  if (data.step === "stepOne") {
    //ContactInfo
    validationDataObj = {
      firstName: Joi.string().required(),
      lastName: Joi.string().allow("").optional(),
      mobile: Joi.number().integer().min(100000000).max(9999999999).required(),
      country: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().length(6).pattern(/^\d+$/).required(),
    };
  }
  if (data.step === "stepTwo") {
    // BusinessInfo
    validationDataObj = {
      shopLogo: Joi.string().required(),
      authorizationImage:Joi.string().optional(),
      category_id: Joi.string().required(),
      category: Joi.optional(),
      mobile: Joi.optional(),
      shopName: Joi.string().required(),
      residentialState: Joi.string().required(),
      residentialCountry: Joi.string().required(),
      residentialCity: Joi.string().required(),
      residentialZipCode: Joi.string().required(),
      residentialAddress: Joi.string().required(),
    };
  }
  if (data.step === "stepThree") {
    //TaxInfo
    validationDataObj = {
      type: Joi.number().required().valid(1, 2).default(1),
      gst: Joi.alternatives().conditional('type', { is: 1, then: Joi.string().required(), otherwise: Joi.string().allow('').optional() }),
      pancard: Joi.alternatives().conditional('type', { is: 2, then: Joi.string().required(), otherwise: Joi.string().allow('').optional() }),
      registration: Joi.alternatives().conditional('type', { is: 1, then: Joi.string().required(), otherwise: Joi.string().allow('').optional() }),
      doc:Joi.string().optional(),
      shipping:Joi.string().required(),
      loa:Joi.string().optional(),
      status:Joi.optional(),
      mobile: Joi.optional(),
    }
  }
 
  if (data.step === "stepFour") {
    //BankInfo
    validationDataObj = {
      bankName: Joi.string().required(),
      accountHolderName: Joi.string().required(),
      accountNumber: Joi.string().required(),
      comfirmAccountNumber: Joi.string().required(),
      cheque: Joi.string().required(),
      ifscCode: Joi.string().required(),
      upi:Joi.number().optional(),
      mobile: Joi.optional(),
    };
  }
  delete data.step;
  const schema = Joi.object(validationDataObj);
  return schema.validate(data);
}

function vendorLoginValidation(data) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
}

module.exports = {
  Vendor,
  vendorFormValidation,
  vendorLoginValidation,
};
