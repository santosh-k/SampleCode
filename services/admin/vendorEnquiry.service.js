const mongoose = require("mongoose");
const config = require("config");
const HttRequest = require("../api.service");
const http = new HttRequest();
const EmailServiceBaseUrl = config.get("service_endpoints.email_service");

// const {
//     VendorEnquiry,
//     addVendorEnquiryFrontValidation,
// } = require('../../models/vendorEnquiry.model');

const { Vendor, vendorFormValidation } = require("../../models/vendor.model");

// const {VendorRequest} = require('../../models/vendorRequest.model');

class vendorEnquiryService {
  constructor() {}

  async submitEnquiryData(req) {
    const { error } = vendorFormValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let { firstName, lastName, email, mobile } = req.body;
    email = email.toLowerCase();
    let findData = await Vendor.findOne({
      $or: [{ email: email }, { mobile: mobile }],
      isDeleted: 0,
    });
    if (findData && findData.email == email)
      throw new ErrorHandler(400, "Email already exist.");
    if (findData && findData.mobile == mobile)
      throw new ErrorHandler(400, "Mobile already exist.");

    let result = await Vendor({
      firstName: firstName,
      lastName: lastName || "",
      email: email,
      mobile: mobile,
    }).save();
    // if(result){
    //   http.post(EmailServiceBaseUrl + "send-email", {
    //     body: {
    //       sendTo: vendorData.email,
    //       templateName: "request_approval",
    //       "#username#": vendorData.name,
    //     },
    //   });
    // }
  
    if (!result)
      throw new ErrorHandler(400, "Data does not save. please try again.");
    return result;

  }

  async list(req) {
    let { skip, limit, body } = req.body;
    skip = +skip || 0;
    limit = +limit || 10;
    
    let search = { isDeleted: 0,requestStatus: {$nin: ["Accepted"]} };
    let dateCondArr = [];
    if (body.name) {
      search.fullName = { $regex: body.name, $options: "i" };
    }
    if (body.email) {
      search.email = { $regex: body.email, $options: "i" };
    }
    if (body.status) {
      search.enquiryStatus = String(body.status);
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
      // let checkVendorEnquiryData = await VendorEnquiry.findOne({_id: id, enquiryStatus: "Accepted"});
      // if (checkVendorEnquiryData.enquiryStatus == "Accepted") {
      //   return `You can't delete ${checkVendorEnquiryData.firstName+" "+checkVendorEnquiryData.lastName} Entry. Because It's Enquiry status is acepted.`
      // }
      let vendorData = await Vendor.findOneAndUpdate(
        { _id: id },
        { isDeleted: 1 },
        // {isRejected:1},
        { new: true }
      );
      http.post(EmailServiceBaseUrl + "send-email", {
        body: {
          sendTo: vendorData.email,
          templateName: "seller_enquiry_reject",
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
  // /api/v1/admin/emailTemplate/list
  // EmailServiceBaseUrl + "/admin/emailTemplate/list"
  async changeEnquiryStatus(req) {
    
    let id = req.body.id;
    let enquiryStatus = req.body.enquiryStatus;
    
    if (id && enquiryStatus) {
      if (enquiryStatus == "Accepted") {
        let vendorData = await Vendor.findOne({ _id: id });
        // console.log(vendorData.email);
        http.post(EmailServiceBaseUrl + "send-email", {
          body: {
            sendTo: vendorData.email,
            templateName: "seller_enquiry_accept",
            "#username#": `${vendorData.firstName} ${vendorData.lastName}`,
          },
        });

        await Vendor.findOneAndUpdate(
          { _id: id },
          { enquiryStatus: enquiryStatus },
          { new: true }
        );
        return  "success" ;
      } 
      else if(enquiryStatus == "Rejected"){
       
        let vendorData = await Vendor.findOne({ _id: id });
       
        http.post(EmailServiceBaseUrl + "send-email", {
          body: {
            sendTo: vendorData.email,
            templateName: "seller_enquiry_reject",
            "#username#": `${vendorData.firstName} ${vendorData.lastName}`,
          },
        });
        
        console.log("email send")
        await Vendor.findOneAndUpdate(
          { _id: id },
          { enquiryStatus: enquiryStatus, isRejected: 1 },
          { new: true }
        );
        
        return  "success" ;


      }
      
      else {
        let vendorEnquiryData = await Vendor.findOneAndUpdate(
          { _id: id },
          { enquiryStatus: enquiryStatus },
          { new: true }
        );
        if (vendorEnquiryData) {
          return "success";
        } else {
          return "error";
        }
      }
    } else {
      return "error";
    }
  }

  async bulkRecordUpdate(req) {
    let { action, action_check } = req.body;
    if (!Array.isArray(action_check)) {
      action_check = [action_check];
    }
   
    let updateObj = {};
    if (action == "Pending") updateObj.enquiryStatus = "Pending";
    if (action == "Accepted") updateObj.enquiryStatus = "Accepted";
    if (action == "Rejected") updateObj.enquiryStatus = "Rejected";
    if (action == "delete") updateObj.isDeleted = 1;
    await Vendor.updateMany(
      { _id: { $in: action_check }, isDeleted: 0 },
      updateObj
    );
    
    return action;
  }
}
exports.vendorEnquiryService = new vendorEnquiryService();
