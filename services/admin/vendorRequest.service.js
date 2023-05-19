const mongoose = require("mongoose");
const config = require("config");
// const { VendorRequest, addVendorRequestFrontValidation} = require('../../models/vendorRequest.model');
// const { VendorEnquiry } = require('../../models/vendorEnquiry.model');
// const { VendorShop } = require('../../models/vendorShop.model');
const HttRequest = require("../api.service");
const http = new HttRequest();
const { Vendor, vendorFormValidation } = require("../../models/vendor.model");
const EmailServiceBaseUrl = config.get("service_endpoints.email_service");

const emailHelper = require("../../helpers/email.helper");
const frontUrl = config.get("frontend");
const emailConfig = config.get("email");

class vendorRequestService {
  constructor() {}

  async addRequestData(req) {
    const { error } = vendorFormValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let {
      firstName,
      lastName,
      mobile,
      countryCode,
      email,
      ipAddress,
      country,
      state,
      city,
      zipCode,
      shopName,
      shopRegistered,
      shopAddress,
      shopEmailId,
      shopPhone,
      shopCountry,
      shopCountryCode,
      shopState,
      shopZipCode,
      shopCity,
      shopImage,
      wareHouseAddress,
      category,
      shippingType,
      shopId,
      gstNumber,
      gstNumberPicture,
      panNumber,
      panNumberPicture,
      vatNumber,
      vatNumberPicture,
      bankName,
      bankAccountHolderName,
      bankAccountNumber,
      bankChequeBookPicture,
      bankIfscCode,
      requestStatus,
      bankAddress,
      bankCountry,
      bankState,
      bankZipCode,
      profilePicture,
    } = req.body;
    shopEmailId = shopEmailId.toLowerCase();
    email = email.toLowerCase();
    let findData = await Vendor.findOne({
      $or: [{ shopEmailId: shopEmailId }, { email: email }],
      isDeleted: 0,
    });
    if (findData && findData.email == email)
      throw new ErrorHandler(400, "Email is already exist.");
    if (findData && findData.shopEmailId == shopEmailId)
      throw new ErrorHandler(400, "shop Email Id is already exist.");
    let result = await Vendor({
      firstName: firstName,
      lastName: lastName || "",
      email: email,
      mobile: mobile,
      countryCode: countryCode,
      password: findData.password,
      ipAddress: ipAddress,
      country: country,
      state: state,
      city: city,
      zipCode: zipCode,
      shopName: shopName,
      shopRegistered: shopRegistered,
      shopAddress: shopAddress,
      shopEmailId: shopEmailId,
      shopPhone: shopPhone,
      shopCountry: shopCountry,
      shopCountryCode: shopCountryCode,
      shopState: shopState,
      shopZipCode: shopZipCode,
      shopCity: shopCity,
      shopImage: shopImage,
      wareHouseAddress: wareHouseAddress,
      category: category,
      shippingType: shippingType,
      shopId: shopId,
      gstNumber: gstNumber,
      gstNumberPicture: gstNumberPicture,
      panNumber: panNumber,
      panNumberPicture: panNumberPicture,
      vatNumber: vatNumber,
      vatNumberPicture: vatNumberPicture,
      bankName: bankName,
      bankAccountHolderName: bankAccountHolderName,
      bankAccountNumber: bankAccountNumber,
      bankChequeBookPicture: bankChequeBookPicture,
      bankIfscCode: bankIfscCode,
      requestStatus: requestStatus,
      bankAddress: bankAddress,
      bankCountry: bankCountry,
      bankState: bankState,
      bankZipCode: bankZipCode,
      profilePicture: profilePicture,
    }).save();
    if (!result)
      throw new ErrorHandler(400, "Data does not save. please try again.");
    return result;
  }

  async list(req) {
    let { skip, limit, body } = req.body;
    skip = +skip || 0;
    limit = +limit || 10;
    // console.log("$$$$%%%%",req.body)
    let search = { isDeleted: 0,requestStatus: { $in: ["Waiting", "Rejected","Accepted"] } };
    // let search = { requestStatus: "Waiting", requestStatus: "Rejected"};
    let dateCondArr = [];
    if (body.name) {
      search.fullName = { $regex: body.name, $options: "i" };
    }
    
    if (body.email) {
      search.email = { $regex: body.email, $options: "i" };
    }
    if (body.shopName) {
      search.shopName = { $regex: body.shopName, $options: "i" };
    }
    if (body.status) {
      search.requestStatus = String(body.status);
      
    }
    if (body.fromdate) {
      dateCondArr.push({ createdAt: { $gte: new Date(body.fromdate) } });
    }
    if (body.todate) {
      let todate = new Date(body.todate);
      dateCondArr.push({
        createdAt: { $lte: new Date(todate.setDate(todate.getDate() + 1)) },
      });
    }
    if (dateCondArr.length) {
      search.$and = dateCondArr;

    }
    
    let totalData = await Vendor.aggregate([
      {
        $addFields: {
          fullName: {
            $cond: [
              {
                $eq: ["$lastName", ""],
              },
              "$firstName",
              {
                $concat: ["$firstName", " ", "$lastName"],
              },
            ],
          },
        },
      },
      { $match: search },
    ]);
   
    let data = await Vendor.aggregate([
      {
        $addFields: {
          fullName: {
            $cond: [
              {
                $eq: ["$lastName", ""],
              },
              "$firstName",
              {
                $concat: ["$firstName", " ", "$lastName"],
              },
            ],
          },
        },
      },
      { $match: search },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    
    return { totalCount: totalData.length || 0, data };
  }

  async deleteRecord(req) {
    let id = req.body.id;
    if (id) {
      // let checkVendorRequestData = await VendorRequest.findOne({_id: id, requestStatus: "Accepted"});
      // if (checkVendorRequestData.requestStatus == "Accepted") {
      //   return `You can't delete ${checkVendorRequestData.firstName+" "+checkVendorRequestData.lastName} Entry. Because It's Enquiry status is acepted.`
      // }
      let vendorData = await Vendor.findOneAndUpdate(
        { _id: id },
        { isDeleted: 1 },
        // { isRejected: 1 },
        { new: true }
      );
      if (vendorData && vendorData.isDeleted == 1) {
        return "success";
      } else {
        return "error";
      }
    } else {
      return "error";
    }
  }

  async changeVendorRequestStatus(req) {
    let { id, requestStatus, rejectReason } = req.body;
    
    let updateData = { requestStatus: requestStatus };
    
    if(id && requestStatus == "Accepted"){
      let vendorData = await Vendor.findOne({ _id: id });
      
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: vendorData.email,
          templateName: "seller_request_accept",
          "#username#": `${vendorData.firstName} ${vendorData.lastName}`,
        },
      });
        const changeData = await Vendor.findByIdAndUpdate({_id:id} ,{requestStatus:"Accepted"})

    }

    if(id && requestStatus == "Rejected"){
      let vendorData = await Vendor.findOne({ _id: id });
      
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: vendorData.email,
          templateName: "seller_request_reject",
          "#username#": `${vendorData.firstName} ${vendorData.lastName}`,
          rejectReason: rejectReason
        },
      });

        const changeData = await Vendor.findByIdAndUpdate({_id:id} ,{ isRejected: 1 })
        //  console.log("%%%%%",changeData)

    }

    if (id) {
      // console.log("$$$$$$$$",id, requestStatus, rejectReason)
      let vendorData = await Vendor.findOne({ _id: id });
    
       
      if (requestStatus == "Rejected" && String(rejectReason).length > 0) {
        // http.post(EmailServiceBaseUrl + "send-email", {
        //   body: {
        //     sendTo: vendorData.email,
        //     templateName: "seller_request_reject",
        //     "#username#": vendorData.name,
        //     rejectReason:rejectReason
        //   },
        // });
        // let vendorData = await Vendor.findOneAndUpdate(
        //   { _id: id },
        //   // { isDeleted: 1 },
        //   { isRejected: 1 },
        //   { new: true }
        // );
        updateData.rejectReason = rejectReason;
      }
      let checkVendorData = await Vendor.findOne({ _id: id });
      if (checkVendorData) {
        if (checkVendorData.shopRegistered == true) {
          let ShopData = {
            vendorId: mongoose.mongo.ObjectID(checkVendorData.id),
            shopName: checkVendorData.shopName || "",
            shopRegistered: checkVendorData.shopRegistered || "",
            shopAddress: checkVendorData.shopAddress || "",
            shopEmailId: checkVendorData.shopEmailId || "",
            shopPhone: checkVendorData.shopPhone,
            shopCountry: checkVendorData.shopCountry || "",
            shopCountryCode: checkVendorData.shopCountryCode || "",
            shopState: checkVendorData.shopState || "",
            shopZipCode: checkVendorData.shopZipCode,
            shopCity: checkVendorData.shopCity || "",
            shopImage: checkVendorData.shopImage || "",
            wareHouseAddress: checkVendorData.wareHouseAddress || "",
          };
          let vendorShop = await Vendor(ShopData).save();
          updateData.shopId = mongoose.mongo.ObjectID(vendorShop.id);
          //   return `Sorry! You can change status of ${checkVendorData.firstName}  ${checkVendorData.lastName} seller. Becuase Some fields are blank`;
        }
        let vendorData = await Vendor.findOneAndUpdate(
          { _id: id },
          updateData,
          { new: true }
        );
        if (vendorData && vendorData.requestStatus == requestStatus) {
          // let htmlData = `<p>Hi  ${vendorData.firstName+""+vendorData.lastName}, your profile is ${requestStatus}</p>.`
          //   if(vendorData.requestStatus == "Rejected"){
          //     htmlData = `<p>Hi  ${vendorData.firstName+""+vendorData.lastName}, your profile is ${requestStatus} due to ${rejectReason} reason</p>.`
          //   }
          //   let mailData = {
          //     from: emailConfig.global.from,
          //     to: vendorData.email,
          //     subject: "Seller status changed Successfully!",
          //     html: htmlData
          //   };
          //   await emailHelper.admin_password_reset(mailData);
          return "success";
        } else {
          return "error";
        }
      }
    } else {
      return "error";
    }
  }

  async getDetails(id) {
    let data = await Vendor.findOne({
      isDeleted: 0,
      _id: mongoose.Types.ObjectId(id),
    });
    
    if (!data) throw new ErrorHandler(400, "Vendor does not exist");
    return data;
  }

  async editDetails(id){
    let data = await Vendor.findOne({
      isDeleted: 0,
      _id: mongoose.Types.ObjectId(id),
    });
   
    if (!data) throw new ErrorHandler(400, "Vendor does not exist");
    return data;
  }
  async bulkRecordUpdate(req) {
    let { action, action_check } = req.body;
    if (!Array.isArray(action_check)) {
      action_check = [action_check];
    }
    let updateObj = {};
    if (action == "Approved") updateObj.requestStatus = "Approved";
    if (action == "Rejected") updateObj.requestStatus = "Rejected";
    if (action == "delete") updateObj.isDeleted = 1;
    await Vendor.updateMany(
      { _id: { $in: action_check }, requestStatus: "NewRequest", category: [] },
      updateObj
    );
    return action;
  }
}
exports.vendorRequestService = new vendorRequestService();
