const mongoose = require('mongoose');
const Helper = require('../../helpers/bcrypt');
const ObjectId = mongoose.Types.ObjectId

const {
  User,
  adminUserValidation
} = require('../../models/user.model');

class UserService {
  constructor() { }

  async list(req) {
    let { skip, limit, sort, body } = req.body;
    skip = +skip || 0;
    limit = +limit || 10;
    let search = { isDeleted: 0 };
    let search_val = body.search.value;
    
    if (search_val) {
      search.$or = [
        { fullName: { $regex: search_val, $options: 'i' } },
        { email: { $regex: search_val, $options: 'i' } },
        { mobile: { $regex: search_val, $options: 'i' } }
      ]
    }
    if (body.name) {
      search.fullName = { $regex: body.name, $options: 'i' };
    }
    if (body.email) {
      search.email = { $regex: body.email, $options: 'i' };
    }
    if (body.status) {
      search.status = parseInt(body.status) == 1 ? true : false;
    }
    let dateCondArr = [];
    if (body.fromdate) {
      dateCondArr.push({ createdAt: { $gte: new Date(body.fromdate) } });
    }
    if (body.todate) {
      let todate = new Date(body.todate);
      dateCondArr.push({ createdAt: { $lte: new Date(todate.setDate(todate.getDate() + 1)) } });
    }
    if (dateCondArr.length) {
      search.$and = dateCondArr
    }
    let totalCount = await User.aggregate([
      {
        $addFields: {
          fullName: {
            $cond: [
              {
                $eq: [
                  "$lastName",
                  ""
                ]
              },
              "$firstName",
              {
                $concat: [
                  "$firstName",
                  " ",
                  "$lastName"
                ]
              }
            ]
          }
        }
      },
      { $match: search }
    ]);
    let data = await User.aggregate([
      {
        $addFields: {
          fullName: {
            $cond: [
              {
                $eq: [
                  "$lastName",
                  ""
                ]
              },
              "$firstName",
              {
                $concat: [
                  "$firstName",
                  " ",
                  "$lastName"
                ]
              }
            ]
          }
        }
      },
      { $match: search },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);
    return { totalCount: totalCount ? totalCount.length : 10, data };
  }

  async userListForCoupon(req) {
    let data = await User.find({}).select('firstName lastName _id email');
    return data;
  }
  async getUserData(req) {
    let data = await User.findOne({_id:ObjectId(req.body.userId)},{firstName:1,lastName:1,email:1,image:1});
    return data
  }
  async add(req) {

    const { error } = adminUserValidation(req.body);
    console.log(error)
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let { firstName, lastName, email, mobile, dob, password, image, gender, countryCode } = req.body;
    email = email.toLowerCase();
    let findData = await User.findOne({
      $or: [
        { email: email },
        { mobile: mobile }
      ],
      isDeleted: 0
    });
    
    if (findData && findData.email == email) throw new ErrorHandler(400, "Email already exist.");
    if (findData && findData.mobile == mobile) throw new ErrorHandler(400, "Mobile already exist.");
    let hasPassword = await Helper.generateSaltValue(password);
    let userAddObj = {
      firstName: firstName,
      lastName: lastName || "",
      email: email,
      password: hasPassword,
      mobile: mobile,
      countryCode: countryCode ? countryCode : '',
      dob: dob,
      gender: gender,
      image: image ? image : ""
    }

    let result = await User(userAddObj).save();
    console.log(result)
    if (!result) throw new ErrorHandler(400, "Data does not save. please try again.");
    return result;
  }

  async getDetails(id) {
    let data = await User.findOne({ _id: mongoose.Types.ObjectId(id), isDeleted: 0 });
    if (!data) throw new ErrorHandler(400, "Data does not exist.");
    return data;
  }

  async saveEdit(req) {
    const { error } = adminUserValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let id = req.params.id;
    
    let { firstName, lastName, email, mobile, image, dob, gender, countryCode } = req.body;
    email = email.toLowerCase();
    let findData = await User.findOne({
      $or: [
        { email: email },
        { mobile: mobile }
      ],
      isDeleted: 0,
      _id: { $ne: id }
    });
    if (findData && findData.email == email) throw new ErrorHandler(400, "Email already exist.");
    if (findData && findData.mobile == mobile) throw new ErrorHandler(400, "Mobile already exist.");
    let data = await User.updateOne({ _id: mongoose.Types.ObjectId(id) }, {
      firstName: firstName,
      lastName: lastName || "",
      email: email,
      mobile: mobile,
      countryCode: countryCode ? countryCode : '',
      dob: dob,
      gender: gender,
      image: image ? image : ""
    });
    return data;
  }

  async bulkRecordUpdate(req) {
    let { action, action_check } = req.body;
    if (!Array.isArray(action_check)) {
      action_check = [action_check];
    }
    let updateObj = {}
    if (action == 'delete') updateObj.isDeleted = 1;
    if (action == 'active') updateObj.status = true;
    if (action == 'inactive') updateObj.status = false;
    await User.updateMany({ _id: { $in: action_check }, isDeleted: 0 }, updateObj);
    return action;
  }

  async changeStatus(req) {
    let { id, status } = req.body;
    status = (status == '1') ? true : false;
    let updatedData = await User.findByIdAndUpdate(id, { status: status }, { new: true });
    if (updatedData && updatedData.status) {
      return "active";
    } else if (updatedData && !updatedData.status) {
      return "inactive";
    } else {
      return "error";
    }
  }

  async deleteRecord(req) {
    let id = req.body.id;
    if (id) {
      let userData = await User.findOneAndUpdate({ _id: id }, { isDeleted: 1 }, { new: true });
      if (userData && userData.isDeleted == 1) {
        return "success";
      } else {
        return "error";
      }
    } else {
      return "error";
    }
  }
}
exports.userService = new UserService();
