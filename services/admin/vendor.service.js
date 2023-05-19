const mongoose = require("mongoose");
const HttRequest = require("../api.service");
const http = new HttRequest();
const config = require("config");
// const { Vendor } = require('../../models/Vendor.model');
const { Vendor } = require("../../models/vendor.model");
const {
  generateSaltValue,
  comparePassword,
  signToken,
} = require("../../helpers/bcrypt");
const EmailServiceBaseUrl = config.get("service_endpoints.email_service");
class vendorService {
  async signup(req) {
    //   const vendor = await Vendor.findOne({ email: req.body.email }).lean();
    //   console.log("vendor" , vendor)
    //   if(vendor){
    //     if(vendor.isRejected == 1){
    //     const data = await new Vendor(req.body).save();

    //     http.post(EmailServiceBaseUrl + "send-email", {
    //       body: {
    //         sendTo: data.email,
    //         templateName: "sign_up_request",
    //         "#username#": `${data.firstName} ${data.lastName}`,
    //       },
    //     });

    //     return data
    //   }
    //   }

    //   else {
    //   if (vendor)
    //   throw new ErrorHandler(400, { email: "email already exists" });

    //   req.body.password = generateSaltValue(req.body.password);

    //   const checkMobile = await Vendor.findOne({ mobile: req.body.mobile });

    //   if (checkMobile) {
    //     throw new ErrorHandler(400, {mobile: "mobile number already exists" });
    //   }

    // }
    //   const data = await new Vendor(req.body).save();

    //   http.post(EmailServiceBaseUrl + "send-email", {
    //     body: {
    //       sendTo: data.email,
    //       templateName: "sign_up_request",
    //       "#username#": `${data.firstName} ${data.lastName}`,
    //     },
    //   });

    //   return data;

    const vendor = await Vendor.findOne({ email: req.body.email }).lean();

    
    if (!vendor) {
      const data = await new Vendor(req.body).save();
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: data.email,
          templateName: "sign_up_request_seller",
          "#username#": `${data.firstName} ${data.lastName}`,
        },
      });
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: "masteradmin@yopmail.com",
          templateName: "sign_up_request_admin",
          "#username#": `${data.firstName} ${data.lastName}`,
        },
      });
      return data;
    } else if (vendor.isRejected == 1) {
      const data = await new Vendor(req.body).save();
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: data.email,
          templateName: "sign_up_request",
          "#username#": `${data.firstName} ${data.lastName}`,
        },
      });

      return data;
    } 
    else if (vendor.isDeleted == 1) {
      const data = await new Vendor(req.body).save();
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: data.email,
          templateName: "sign_up_request",
          "#username#": `${data.firstName} ${data.lastName}`,
        },
      });

      return data;
    } 
    
    
    else {
      if (vendor) {
        const checkMobile = await Vendor.findOne({ mobile: req.body.mobile });

        if (checkMobile) {
          throw new ErrorHandler(400, {
            mobile: "mobile number already exists",
          });
        }

        req.body.password = generateSaltValue(req.body.password);

        throw new ErrorHandler(400, { email: "email already exists" });
      }
    }
  }

  async updateWrongAttPass(req) {
    let updateVal = req.body.updateVal;
    await Vendor.updateOne(
      { _id: id },
      { wrongPasswordAtt: updateVal, wrongPasswordAttTime: new Date() }
    );
    return true;
  }
  async getUser(req) {
   
    let useremail = req.body.useremail;
    // sorted function instead of isRejected
    let user = await Vendor.findOne({
      email: useremail,
      status: true,
    }).select({ password: 0, wrongPasswordAtt: 0 }).sort({createdAt: -1}).limit(1).lean();
   
    if (!user) return false;
  
    return user;
  }
  async login(data) {
    const enquiryStatus = await Vendor.findOne(
      { email: data.email },
      { enquiryStatus: 1,requestStatus:1, isDeleted: 1, isRejected: 1,status:1},
      { sort: { createdAt: -1 }, limit: 1 }
    );
      
     if(enquiryStatus.requestStatus == "Rejected" && enquiryStatus.isRejected == 1){
      const vendors = await Vendor.findOne({
        email: data.email,
        isRejected: 1,
      }).lean();
      if (!vendors) throw new ErrorHandler(400, "vendor not found");
      if (comparePassword(data.password, vendors.password)) {
        delete vendors.password;
        const token = signToken(vendors);
        return { token, status: true, msg: "Login success", vendors };
      }
      return { token: "", state: false, msg: "email or password is wrong" };
    }

    else if (enquiryStatus.isRejected == 1) {
      throw new ErrorHandler(
        400,
        "Your request was rejected. Please contact Carorbis or perform sign up again."
      );
    }
    else if(enquiryStatus.isDeleted == 1){
      throw new ErrorHandler(
        400,
        "Your request was deleted. Please contact Carorbis or perform sign up again."
      );
    }
    else if(enquiryStatus.status == false){
      throw new ErrorHandler(
        400,
        "Your request is in inactive state. Please contact Carorbis."
      );
    }
    else if (enquiryStatus.enquiryStatus != "Accepted") {
      throw new ErrorHandler(
        400,
        "Your request is not approved. Please contact Carorbis."
      );
    }
    


    const vendors = await Vendor.findOne({
      email: data.email,
      isDeleted: 0,
      isRejected: 0,
    }).lean();
    if (!vendors) throw new ErrorHandler(400, "vendor not found");
    if (comparePassword(data.password, vendors.password)) {
      delete vendors.password;
      const token = signToken(vendors);
      return { token, status: true, msg: "Login success", vendors };
    }
    return { token: "", state: false, msg: "email or password is wrong" };
  }

  async updateVendorInfo(req) {
    return await Vendor.updateOne({ _id: data._id }, { $set: req.body });
  }

  async list(req) {
    let { skip, limit, body } = req.body;
    skip = +skip || 0;
    limit = +limit || 10;
    let search = { isDeleted: 0, requestStatus: "Accepted" };
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
    if (body.mobile) {
      search.mobile = parseInt(body.mobile);
    }
    if (body.status) {
      search.status = parseInt(body.status) == 1 ? true : false;
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
    return { totalCount: data.length || 0, data };
  }

  async deleteRecord(req) {
    let id = req.body.id;
    if (id) {
      let vendorData = await Vendor.findOneAndUpdate(
        { _id: id },
        { isDeleted: 1 },
        // {isRejected:1},
        { new: true }
      );

      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: vendorData.email,
          templateName: "manage_seller_reject",
          "#username#": `${vendorData.firstName} ${vendorData.lastName}`,
        },
      });

      if (vendorData && vendorData.isDeleted == 1) {
        return "success";
      } else {
        return "error";
      }
    } else {
      return "error";
    }
  }

  async changeStatus(req) {
    let { id, status } = req.body;
    status = status == "1" ? true : false;
    let updatedData = await Vendor.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (updatedData && updatedData.status) {
      return "active";
    } else if (updatedData && !updatedData.status) {
      return "inactive";
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
  async vendorDetails(req) {
    let id = req.params.id;
    let data = req.body.data;

    let vendorDetails;
    if (data.step == "stepOne") {
      let stepOne = {
        country: data.country,
        state: data.state,
        city: data.city,
        zip: data.zip,
      };
      vendorDetails = await Vendor.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          $set: {
            firstName: data.firstName,
            lastName: data.lastName,
            mobile: data.mobile,
            stepOne: stepOne,
            stepNumber: 2,
          },
        }
      );
    } else if (data.step == "stepTwo") {
      let category = [];
      let catId = data.category_id;
      let catName = data.category;
      console.log("im in dangerzone",catId,catName)
      catName = catName.split(",");
      catId = catId.split(",");
      let stepTwo = {
        shopLogo: data.shopLogo,
        // authorizationImage:data.authorizationImage,
        sellCategory: catId,
        categoryName: catName,
        shopName: data.shopName,
        residentialState: data.residentialState,
        residentialCountry: data.residentialCountry,
        residentialCity: data.residentialCity,
        residentialZipCode: data.residentialZipCode,
        residentialAddress: data.residentialAddress,
      };
      vendorDetails = await Vendor.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          $set: {
            stepTwo: stepTwo,
            stepNumber: 3,
          },
        }
      );
    } else if (data.step == "stepThree") {
      console.log("in vendor service ",data)
      let stepThree = {
        
        gst: data.gst,
        pancard: data.pancard,
        type:data.type,
        registration: data.registration,
        doc: data.doc,
        loa: data.loa,
        shipping: data.shipping,
      };
      vendorDetails = await Vendor.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          $set: {
            stepThree: stepThree,
            stepNumber: 4,
            
          },
        }
      );
    } else {
      let stepFour = {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        upi:data.upi,
        cheque: data.cheque,
      };
      // here
      vendorDetails = await Vendor.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          $set: {
            stepFour: stepFour,
            stepNumber: 4,
            isRejected:0,
            requestStatus: "Waiting",
          },
        }
      );
    }
    // console.log("vendorDetails", vendorDetails);
    if (!vendorDetails) throw new ErrorHandler(400, "data not saved");

    return vendorDetails;
  }
  async getUserId(req) {
    let { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) return false;
    let userData = await Vendor.findOne({
      _id: mongoose.mongo.ObjectId(userId),
      isDeleted: 0,
    }).select({ password: 0 });
    if (!userData) return false;
    return userData;
  }
  async bulkRecordUpdate(req) {
    let { action, action_check } = req.body;
    if (!Array.isArray(action_check)) {
      action_check = [action_check];
    }
    let updateObj = {};
    if (action == "delete") updateObj.isDeleted = 1;
    if (action == "active") updateObj.status = true;
    if (action == "inactive") updateObj.status = false;
    await Vendor.updateMany(
      { _id: { $in: action_check }, isDeleted: 0 },
      updateObj
    );
    return action;
  }

  async get_vendor_list(req) {
    let search = { isDeleted: 0, enquiryStatus: "Accepted", stepNumber: 4 };
    let data = await Vendor.aggregate([
      { $match: search },
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
      { $sort: { createdAt: -1 } },
    ]);
    return data;
  }
}
exports.vendorService = new vendorService();
