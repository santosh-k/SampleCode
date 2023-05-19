const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const jwt = require('jsonwebtoken');
const Email = require('../../helpers/emails')
const lang_en = require("../../helpers/language/EN.json");
const {
  User,
  addUserFrontValidation,
  addUserValidation,
  addSocialSignUpUserValidation,
  addSocialSignInUserValidation,
  loginPassValidation,
  loginOtpValidation,
  forgetPasswordValidation,
  resetPasswordValidation,
  resetMobileValidation,
  changePasswordValidation,
  editUserFrontValidation,
  verifyRegistrationValidation,
  resendOtpValidation,
  verifyEmailOtpValidation,
  verifyMobileOtpValidation,
  resetEmailValidation,
  changeResetPasswordValidation,
} = require('../../models/user.model');

const {
  userOtp,
  addUserOtpValidation
} = require('../../models/userotp.model');

const {
  Address,
  addUserAddressValidation,
  editUserAddressValidation,
  deleteUserAddressValidation,
  defaultAddressValidation,
  getAddressValidation
} = require("../../models/address.model");
const Helper = require('../../helpers/bcrypt');
const { v4 } = require("uuid");
const config = require('config');
const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const logger = require('../../helpers/logger');
const ErrorHandler = require('../../helpers/error');
const { data } = require('../../helpers/logger');
const s3 = new AWS.S3({
  accessKeyId: config.get("SECRET.AWS_ACCESS_KEY_ID"),
  secretAccessKey: config.get("SECRET.AWS_SECRET_ACCESS_KEY"),
});
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get("SECRET.SENDGRID_API_KEY"))
const { Mobile } = require('aws-sdk');

class UserService {

  async sendOtp(req) {


    const { error } = addUserOtpValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { mobile, countryCode } = req.body;
    let result = {};
    let findUserMobile = await User.findOne({ mobile: mobile, countryCode: countryCode, isDeleted: 0 });
    if (findUserMobile) throw new ErrorHandler(400, lang_en.USER.MOBILEEXIST);
    let findData = await userOtp.findOne({ mobile: mobile, isDeleted: 0 });
    let otp = generateOtp();
    // let otp = Math.floor(1000 + Math.random() * 9000);
    // let checkUser = await User.findOne({ $or: [{ email: email }, { mobile: mobile }], isDeleted: 0, status: true, isVerified: false });
    if (findData) {
      // result = await userOtp.updateOne({_id:findData._id},{$set:{isDeleted:1}})
      result = await userOtp.updateOne({ _id: findData._id }, { $set: { otp: otp } }, { new: true });
    } else {
      // dbTime = findData.createdAt;
      // var newDateObj = new Date();
      // newDateObj.setTime(dbTime.getTime() + (2 * 60 * 1000));
      // if(dbTime>newDateObj){
      //   throw new ErrorHandler(400,"Your OTP is Expired")
      // }
      result = await userOtp({ mobile: mobile, otp: otp, countryCode: countryCode, isDeleted: 0 }).save();
    }
    return result;
  }

  async resendOtp(req) {
    let { language_id, lang_code } = req.header;

    // const { error } = resendOtpValidation(req.body);
    // if (error) {
    //   throw new ErrorHandler(400, error.details[0].message);
    // }
    // let { mobile, email } = req.body;

    // let otp = 1234;
    // // let otp = Math.floor(1000 + Math.random() * 9000);
    // let findUser = await User.findOne({ $or: [{ email: email }, { mobile: mobile }], isDeleted: 0, status: true, isVerified: false });
    // if (findUser && findUser.email == email) throw new ErrorHandler(400, "Email already exist. Please login");
    // if (findUser && findUser.mobile === mobile) {
    //   result = await User.updateOne({ _id: findUser._id }, { $set: { otp: otp } }, { new: true });
    // }
    // // if (findUser && findUser.email == email) throw new ErrorHandler(400, "Email already exist. Please login");
    // // if (findUser && findUser.mobile == mobile) throw new ErrorHandler(400, "Mobile already exist. Please login");
    // const tokenData = jwt.sign({
    //   email: email,
    //   otp: otp
    // },
    //   config.get("SECRET.FRONT_JWT_SECRET"),
    //   {
    //     expiresIn: '180s'
    //   });

    // let returnData = {
    //   email: email,
    //   mobile: mobile,
    //   otp: otp,
    //   token: tokenData
    // }
    // return returnData;
    const { error } = addUserOtpValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { mobile, countryCode } = req.body;
    let result = {};
    let findUserMobile = await User.findOne({ mobile: mobile, countryCode: countryCode, isDeleted: 0 });
    if (findUserMobile) throw new ErrorHandler(400, lang_en.USER.MOBILEEXIST);
    let findData = await userOtp.findOne({ mobile: mobile, isDeleted: 0 });
    let otp = generateOtp();
    // let otp = Math.floor(1000 + Math.random() * 9000);
    // let checkUser = await User.findOne({ $or: [{ email: email }, { mobile: mobile }], isDeleted: 0, status: true, isVerified: false });
    if (findData) {
      // result = await userOtp.updateOne({_id:findData._id},{$set:{isDeleted:1}})
      result = await userOtp.updateOne({ _id: findData._id }, { $set: { otp: otp } }, { new: true });
    } else {
      // dbTime = findData.createdAt;
      // var newDateObj = new Date();
      // newDateObj.setTime(dbTime.getTime() + (2 * 60 * 1000));
      // if(dbTime>newDateObj){
      //   throw new ErrorHandler(400,"Your OTP is Expired")
      // }
      result = await userOtp({ mobile: mobile, otp: otp, countryCode: countryCode, isDeleted: 0 }).save();
    }

  }

  async verifyOtp(req) {


    const { error } = verifyRegistrationValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { mobile, otp, ip_address, device_id, countryCode } = req.body;
    let checkMobile = await User.findOne({ mobile: mobile, countryCode: countryCode, isDeleted: 0, status: true });
    if (!checkMobile) throw new ErrorHandler(400, lang_en.USER.NOTEXISTMOBILE);
    let dbTime = checkMobile.otpTime;
    var newDateObj = new Date();
    if ((newDateObj - dbTime) >= (2 * 60 * 1000)) {
      throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
    }
    if (otp === checkMobile.otp) {
      await User.findOneAndUpdate({ mobile: mobile }, { $set: { ip_address: ip_address, device_id: device_id } }, { new: true })
      const token = jwt.sign({
        _id: checkMobile._id,
        mobile: mobile,
        countryCode: countryCode
      }, config.get("SECRET.FRONT_JWT_SECRET"),
        {
          expiresIn: '24h'
        });
      return token;

    }

  }

  async loginOtp(req) {
    let { language_id, lang_code } = req.header;
    const { error } = loginOtpValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let { mobile, countryCode } = req.body;
    let mobileData = await User.findOne({ mobile: mobile, countryCode: countryCode, isDeleted: 0 }).sort({ createdAt: -1 });

    if (!mobileData) throw new ErrorHandler(404, lang_en.USER.NOTEXISTMOBILE);
    if (mobileData.status == false) throw new ErrorHandler(400, lang_en.USER.INACTIVEACCOUNT);
    let otpTime = new Date();
    let otp = generateOtp();
    await User.findOneAndUpdate({ mobile: mobile, countryCode: countryCode }, { $set: { otp: otp, otpTime: otpTime } }, { new: true })

    return otp
  }

  async signUp(req) {
    const { error } = addUserValidation(req.body);
    let { language_id, lang_code } = req.header;
    if (error) throw new ErrorHandler(400, error.details[0].message);

    let { email, name, mobile, countryCode, password, otp } = req.body;

    let findOtp = await userOtp.findOne({ mobile: mobile, countryCode: countryCode, otp, isDeleted: 0 }).sort({ createdAt: -1 });
    if (!findOtp) throw new ErrorHandler(400, lang_en.USER.OTPNOTVALID);
    let dbTime = findOtp.createdAt;
    var newDateObj = new Date();

    if ((newDateObj - dbTime) >= (2 * 60 * 1000)) throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP);
    let findData = await User.findOne({ $or: [{ email: email }, { mobile: mobile }], isDeleted: 0 });
    if (findData) throw new ErrorHandler(400, lang_en.USER.USEREXIST);
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser = new User({
      firstName:name,
      email,
      mobile,
      countryCode,
      isVerifiedMobile: true,
      isVerifiedEmail: false,
      language_id: language_id,
      lang_code: lang_code,
      password: hashedPassword
    })
    await newUser.save();
    await userOtp.findByIdAndUpdate(findOtp._id, { otp: 0, isDeleted: 1 });
    return true
  }

  async loginPassword(req) {
    let { language_id, lang_code } = req.header;

    const { error } = loginPassValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    // const lang = require('../../helpers/language/' + langcode + '.json')
    let { email, password, ip_address, device_id } = req.body;
    let userData = await User.findOne({ email: email, isDeleted: 0 });

    if (!userData) throw new ErrorHandler(404, lang_en.USER.NOTEXISTEMAIL);
    if (userData.status == false) throw new ErrorHandler(400, lang_en.USER.INACTIVEACCOUNT);

    if (userData) {
      if (!Helper.comparePassword(password, userData.password)) {
        throw new ErrorHandler(400, lang_en.USER.INCORRECTPASSWORD);
      }
      else {
        await User.findOneAndUpdate({ email: email }, { $set: { language_id: language_id, ip_address: ip_address, device_id: device_id } }, { new: true })
        const token = jwt.sign({
          _id: userData._id,
          email: email
        }, config.get("SECRET.FRONT_JWT_SECRET"),
          {
            expiresIn: '24h'
          });
        return token;
      }
    }
  }

  async getDetails(req) {

    let { language_id, lang_code } = req.headers;
    let data = await User.findOne({ _id: mongoose.Types.ObjectId(req.user._id), isDeleted: 0 }).select(
      {
        "name": "$firstName",
        "image": 1,
        "mobile": 1,
        "countryCode": 1,
        "email": 1,
        "isVerifiedMobile": 1,
        "isVerifiedEmail": 1
      });
    return data;
  }

  async getUserOtp(id) {
    let data = await User.findOne({ _id: mongoose.Types.ObjectId(id), isDeleted: 0 }).select(
      {
        "otp": 12345
      });
    if (!data) throw new ErrorHandler(400, lang_en.USER.INVALIDTOKEN);
    return data;
  }

  async getUserOldPassword(id) {

    return data;
  }

  async updateDetails(req) {
    const { error } = editUserFrontValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { name, email, mobile } = req.body;

    let findData = await User.findOne({
      $or: [
        { email: email },
        { mobile: mobile }
      ],
      isDeleted: 0,
      status: true,
      _id: { $ne: req.user._id }
    });

    let updateObj = {
      firstName: name,
      email: email,
      mobile: mobile,
      isVerifiedEmail: true,
      isVerifiedMobile: true
    }
    if (req.files && req.files.image) {
      const uploadedImage = await s3.upload({
        Bucket: config.get("SECRET.BUCKET_NAME"),
        Key: v4() + "_" + req.files.image.name,
        Body: req.files.image.data
      }).promise();
      if (uploadedImage && uploadedImage.Location) {
        updateObj.image = uploadedImage.Location;
      }
    }

    let result = await User.findOneAndUpdate({ _id: req.user._id }, {
      $set: updateObj
    }, { new: true }).select(
      {
        "name": "$firstName",
        "image": 1,
        "mobile": 1,
        "email": 1,
        "isVerifiedEmail": 1,
        "isVerifiedMobile": 1,
      })

    if (!result) throw new ErrorHandler(400, "Profile does not updated. Please try again.");
    return result;
  }

  async forgetPassword(req) {
    const { error } = forgetPasswordValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let findData = await User.findOne({ email: req.body.email, isDeleted: 0, status: true });
    if (!findData) throw new ErrorHandler(400, lang_en.USER.NOTEXISTEMAIL);
    let data = await User.findOneAndUpdate({ email: req.body.email }, {
      $set: {
        otp: 1234,
      }
    }, { new: true })
    return data;
  }

  async resetWithEmail(req) {
    let { language_id, lang_code } = req.header;

    const { error } = resetPasswordValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { email } = req.body;
    let findEmail = await User.findOne({ email: email, isDeleted: 0, status: true });
    if (!findEmail) throw new ErrorHandler(400, lang_en.USER.NOTEXISTEMAIL);

    if (findEmail) {
      let otp = generateOtp();
      let otpTime = new Date();
      await User.findOneAndUpdate({ email: email, isDeleted: 0, status: true }, { $set: { otp: otp, otpTime: otpTime } }, { new: true });
      Email.sendMail({
        to: `${email}`,
        from: config.get('SECRET.SENDGRID_SEND_EMAIL'),
        subject: "OTP FOR RESET MAIL",
        content: "Your OTP IS 1234"
      })
    }

    return true;
  }

  async resetWithMobile(req) {
    let { language_id, lang_code } = req.header;
    const { error } = resetMobileValidation(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message)
    let { mobile, countryCode } = req.body;
    let findMobile = await User.findOne({ mobile: mobile, countryCode: countryCode, isDeleted: 0 });
    if (!findMobile) throw new ErrorHandler(400, lang_en.USER.NOTEXISTMOBILE);
    if (findMobile.status == false) throw new ErrorHandler(400, lang_en.USER.INACTIVEACCOUNT)

    if (findMobile) {
      let otp = generateOtp();
      let otpTime = new Date();
      

      await User.findOneAndUpdate({ mobile: mobile, countryCode: countryCode, isDeleted: 0 }, { $set: { otp: otp, otpTime: otpTime } }, { new: true });
    }



  }

  async verifyMobileResetOtp(req) {
    let { language_id, lang_code } = req.header;
    const { error } = verifyRegistrationValidation(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message)
    let { mobile, otp, ip_address, device_id } = req.body;
    let checkMobile = await User.findOne({ mobile: mobile, isDeleted: 0 });
    if (!checkMobile) throw new ErrorHandler(400, lang_en.USER.NOTEXISTMOBILE);
    let dbTime = checkMobile.otpTime;
    var newDateObj = new Date();
    if ((newDateObj - dbTime) >= (2 * 60 * 1000)) {
      throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
    }
    if (otp === checkMobile.otp) {

      return true;

    } else {
      throw new ErrorHandler(400, "OTP IS NOT VERIFIED")
    }
  }

  async changeResetPass(req) {
    let { language_id, lang_code } = req.header;

    const { error } = changeResetPasswordValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { email, mobile, newPassword } = req.body;
    let checkUser = await User.findOne({ $or: [{ email: email }, { mobile: mobile }], isDeleted: 0, status: true });
    if (!checkUser) throw new ErrorHandler(400, lang_en.USER.NOTEXISTMOBILE);
    let dbTime = checkUser.otpTime;
    var newDateObj = new Date();

    if ((newDateObj - dbTime) >= (2 * 60 * 1000)) {
      throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
    }
    if (email) {
      let data = await User.findOne({ email: email, isDeleted: 0 }).select(
        {
          "password": 1
        });
      if (!data) throw new ErrorHandler(400, lang_en.USER.INVALIDTOKEN);
      if (data) {

        let hasPassword = Helper.generateSaltValue(req.body.newPassword);
        let dataUpdate = await User.updateOne({ email: email }, {
          $set: {
            password: hasPassword
          }
        });
        return "Password Change successfully.";

      }
    } else if (mobile) {
      let data = await User.findOne({ mobile: mobile, isDeleted: 0 }).select(
        {
          "password": 1
        });
      if (!data) throw new ErrorHandler(400, lang_en.USER.INVALIDTOKEN);
      if (data) {

        let hasPassword = Helper.generateSaltValue(req.body.newPassword);
        let dataUpdate = await User.updateOne({ mobile: mobile }, {
          $set: {
            password: hasPassword
          }
        });
        return "Password Change successfully.";

      }
    } else {
      throw new ErrorHandler(400, "PLEASE PROVIDE EMAIL OR MOBILE")
    }
  }



  async verifyEmailResetOtp(req) {
    let { language_id, lang_code } = req.header;
    const { error } = verifyEmailOtpValidation(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message)
    let { email, otp, ip_address, device_id } = req.body;
    let checkEmail = await User.findOne({ email: email, isDeleted: 0 });
    if (!checkEmail) throw new ErrorHandler(400, lang_en.USER.NOTEXISTEMAIL);
    let dbTime = checkEmail.otpTime;
    var newDateObj = new Date();
    if ((newDateObj - dbTime) >= (2 * 60 * 1000)) {
      throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
    }
    if (otp === checkEmail.otp) {

      return true;

    } else {
      throw new ErrorHandler(400, "OTP IS NOT VERIFIED")
    }


  }


  async changePassword(req) {
    let { language_id, lang_code } = req.header;

    const { error } = changePasswordValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { oldPassword, newPassword } = req.body;
    let id = req.user._id;
    let data = await User.findOne({ _id: mongoose.Types.ObjectId(id), isDeleted: 0 }).select(
      {
        "password": 1
      });
    if (!data) throw new ErrorHandler(400, lang_en.USER.INVALIDTOKEN);

    if (data) {
      let result = Helper.comparePassword(oldPassword, data.password);
      if (!result) throw new ErrorHandler(400, lang_en.USER.INCORRECTPASSWORD);
      if (result) {
        let hasPassword = Helper.generateSaltValue(req.body.newPassword);
        let dataUpdate = await User.updateOne({ _id: mongoose.Types.ObjectId(data._id) }, {
          $set: {
            password: hasPassword
          }
        });
        return "Password Change successfully.";
      }
    }
  }

  async addAddress(req) {
    const { error } = addUserAddressValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let { firstName, lastName, email, mobile, pinCode, flat_House_no_Building_Company_Apartment, area_Street_Sector_Village, landmark, town_City, state, address_Type, countryCode, isDefault } = req.body;
    if (isDefault === true) {
      await Address.updateMany(
        { "user_id": mongoose.Types.ObjectId(req.user._id), "isDeleted": 0 },
        {
          $set: {
            "isDefault": false
          }
        })

      await Address.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          "isDefault": true
        }
      }, { new: true });
    }
    let data = Address({
      user_id: req.user._id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      mobile: mobile,
      countryCode: countryCode,
      pinCode: pinCode,
      flat_House_no_Building_Company_Apartment: flat_House_no_Building_Company_Apartment,
      area_Street_Sector_Village: area_Street_Sector_Village,
      landmark: landmark,
      town_City: town_City,
      state: state,
      address_Type: address_Type,
      isDefault: isDefault
    }).save();
    if (!data) throw new ErrorHandler(400, "Data does not exist.");
    return data;
  }

  async editAddress(req) {
    const { error } = editUserAddressValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let { firstName, lastName, email, mobile, pinCode, flat_House_no_Building_Company_Apartment, area_Street_Sector_Village, landmark, town_City, state, address_Type, isDefault } = req.body;
    if (isDefault === true) {
      await Address.updateMany(
        { "user_id": mongoose.Types.ObjectId(req.user._id), "isDeleted": 0 },
        {
          $set: {
            "isDefault": false
          }
        })

      await Address.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          "isDefault": true
        }
      }, { new: true });
    }
    let updateObj = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      mobile: mobile,
      pinCode: pinCode,
      flat_House_no_Building_Company_Apartment: flat_House_no_Building_Company_Apartment,
      area_Street_Sector_Village: area_Street_Sector_Village,
      landmark: landmark,
      town_City: town_City,
      state: state,
      address_Type: address_Type,
      isDefault: isDefault

    }
    let data = await Address.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, {
      $set: updateObj
    }, { new: true })

    if (!data) throw new ErrorHandler(400, "Data does not save. please try again.");
    return data;
  }

  async deleteAddress(id) {


    let data = await Address.updateOne({ _id: mongoose.Types.ObjectId(id) }, {
      $set: { "isDeleted": 1 }
    }, { new: true });
    if (!data.n == 1 || !data.nModified == 1) throw new ErrorHandler(400, "User address can't delete as per address id");
    return data;
  }

  async getAddress(req) {
    let data = await Address.find({ user_id: mongoose.Types.ObjectId(req.user._id), isDeleted: 0 }).sort({ isDefault: -1 });
    if (Array.isArray(data) && data.length > 0) {

      return data;
    } else {
      throw new ErrorHandler(400, "Address does not exist.");
    }
  }

  async defaultAddress(req) {
    const { error } = defaultAddressValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let addressCheck = await Address.find({ user_id: mongoose.Types.ObjectId(req.user._id), _id: mongoose.Types.ObjectId(req.body.id), isDeleted: 1, });
    if (!addressCheck) throw new ErrorHandler(400, "Address not found as per id.");
    if (addressCheck.length > 0) {
      throw new ErrorHandler(400, "This address was deleted as per address id");
    }

    await Address.updateMany(
      { "user_id": mongoose.Types.ObjectId(req.user._id), "isDeleted": 0 },
      {
        $set: {
          "isDefault": false
        }
      })

    await Address.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        "isDefault": true
      }
    }, { new: true });

    return true;
  }

  async profileMobileOtp(req) {


    const { error } = addUserOtpValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { mobile, countryCode } = req.body;
    let result = {};
    let findUserMobile = await User.findOne({ mobile: mobile, countryCode: countryCode, isDeleted: 0 });
    if (findUserMobile) throw new ErrorHandler(400, lang_en.USER.USEREXIST);
    if (!findUserMobile) {
      let findData = await userOtp.findOne({ mobile: mobile, isDeleted: 0 });
      let otp = generateOtp();
      let otpTime = new Date();

      if (findData) {
        result = await userOtp.updateOne({ _id: findData._id }, { $set: { otp: otp, otpTime: otpTime } }, { new: true });
      } else {

        result = await userOtp({ mobile: mobile, otp: otp, otpTime: otpTime, countryCode: countryCode, isDeleted: 0 }).save();
      }
    }


  }

  async emailOtp(req) {
    let { language_id, lang_code } = req.header;

    const { error } = resetPasswordValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { email } = req.body;
    let findEmail = await User.findOne({ email: email, isDeleted: 0 });
    if (findEmail) throw new ErrorHandler(400, lang_en.USER.USEREXIST);

    if (!findEmail) {

      let otp = generateOtp();
      let otpTime = new Date();
      let findEmailOtp = await userOtp.findOne({ email: email, isDeleted: 0 });
      if (findEmailOtp) {
        await userOtp.findOneAndUpdate({ email: email, isDeleted: 0 }, { $set: { otp: otp, otpTime: otpTime } }, { new: true });
      } else {
        await userOtp({ email: email, otp: otp, otpTime: otpTime, isDeleted: 0 }).save();

      }
      Email.sendMail({
        to: `${email}`,
        from: config.get('SECRET.SENDGRID_SEND_EMAIL'),
        subject: "OTP FOR RESET MAIL",
        content: "Your OTP IS 1234"
      })
    }

    return true;

  }

  async verifyEmail(req) {
    const { error } = verifyEmailOtpValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { email, otp, ip_address, device_id } = req.body;
    let checkEmail = await User.findOne({ email: email, isDeleted: 0 });
    if (checkEmail) throw new ErrorHandler(400, lang_en.USER.USEREXIST);
    let checkEmailOtp = await userOtp.findOne({ email: email, isDeleted: 0 });
    let dbTime = checkEmailOtp.otpTime;
    var newDateObj = new Date();
    if ((newDateObj - dbTime) >= (2 * 60 * 1000)) {
      throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
    }
    if (otp === checkEmailOtp.otp) {
      await userOtp.findOneAndUpdate({ email: email, isDeleted: 0, status: true }, { $set: { isVerifiedEmail: true } }, { new: true });

      return true;

    } else {
      throw new ErrorHandler(400, "WRONG OTP")
    }
  }


  async verifyMobile(req) {
    const { error } = verifyMobileOtpValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    let { mobile, otp, ip_address, device_id } = req.body;
    let checkMobile = await User.findOne({ mobile: mobile, isDeleted: 0 });
    if (checkMobile) throw new ErrorHandler(400, lang_en.USER.USEREXIST);
    let checkMobileOtp = await userOtp.findOne({ mobile: mobile, isDeleted: 0 });

    if (!checkMobile) {
      let dbTime = checkMobileOtp.otpTime;
      var newDateObj = new Date();
      if ((newDateObj - dbTime) >= (2 * 60 * 1000)) {
        throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
      }
      if (otp === checkMobileOtp.otp) {
        await userOtp.findOneAndUpdate({ mobile: mobile, isDeleted: 0, status: true }, { $set: { isVerifiedMobile: true } }, { new: true });

        return true;

      } else {
        throw new ErrorHandler(400, "WRONG OTP")
      }
    }
  }

  async getAddDetails(req) {
    const { error } = getAddressValidation(req.body);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }
    let { id } = req.body;
    let data = await Address.findOne({ _id: mongoose.Types.ObjectId(id), isDeleted: 0 }).select(
      {
        "user_id": 1,
        "firstName": 1,
        "lastName": 1,
        "email": 1,
        "mobile": 1,
        "countryCode": 1,
        "pinCode": 1,
        "flat_House_no_Building_Company_Apartment": 1,
        "area_Street_Sector_Village": 1,
        "landmark": 1,
        "town_City": 1,
        "state": 1,
        "address_Type": 1,
        "isDefault": 1
      });
      return data;
  }
   

  async socialSignUp (req) {
    const { error } = addSocialSignUpUserValidation(req.body)
    if (error) throw new ErrorHandler(400, error.details[0].message)
    let {
      email,
      name,
      mobile,
      socialId,
      countryCode,
      otp,
      modeOfSignUp
    } = req.body
    let findData = await User.findOne({
      $or: [{ email: email }, { socialId: socialId }, { mobile: mobile }],
      isDeleted: 0
    })
    if (findData && findData.email == email) {
      throw new ErrorHandler(400, lang_en.USER.EMAILEXIST)
    }
    if (findData && findData.mobile == mobile) {
      throw new ErrorHandler(400, lang_en.USER.MOBILEEXIST)
    }
    if (findData && findData.socialId == socialId) {
      // await User.findByIdAndUpdate(findData._id,{ $set: { language_id: language_id} }, { new: true })
      const token = jwt.sign(
        {
          _id: findData._id,
          socialId: socialId
        },
        config.get('SECRET.FRONT_JWT_SECRET'),
        {
          expiresIn: '24h'
        }
      )
      return token
    }

    let findOtp = await userOtp
      .findOne({ mobile: mobile, countryCode: countryCode, otp, isDeleted: 0 })
      .sort({ createdAt: -1 })
    if (!findOtp) throw new ErrorHandler(400, lang_en.USER.OTPNOTVALID)
    let dbTime = findOtp.createdAt
    var newDateObj = new Date()

    if (newDateObj - dbTime >= 2 * 60 * 1000) {
      throw new ErrorHandler(400, lang_en.USER.EXPIREDOTP)
    }

    // if (findData) throw new ErrorHandler(400, lang_en.USER.USEREXIST)
    let newUser = new User({
      firstName: name,
      email,
      mobile,
      modeOfSignUp,
      countryCode,
      socialId,
      isVerifiedMobile: true,
      isVerifiedEmail: false
    })
    await newUser.save()
    await userOtp.findByIdAndUpdate(findOtp._id, { otp: 0, isDeleted: 1 })
    const token = jwt.sign(
      {
        _id: newUser._id,
        email: email
      },
      config.get('SECRET.FRONT_JWT_SECRET'),
      {
        expiresIn: '24h'
      }
    )
    return token;
  }

  async socialSignIn(req) {
    const { error } = addSocialSignInUserValidation(req.body)
    if (error) throw new ErrorHandler(400, error.details[0].message)
    let { socialId } = req.body
    let findData = await User.findOne({
      socialId: socialId,
      isDeleted: 0
    })
    if (!findData) {
      throw new ErrorHandler(400, lang_en.USER.USERNOTEXIST)
    } else {
      // await  User.findByIdAndUpdate(findData._id,{ $set: { language_id: language_id, ip_address: ip_address, device_id: device_id } }, { new: true })
      const token = jwt.sign(
        {
          _id: findData._id,
          email: findData.email
        },
        config.get('SECRET.FRONT_JWT_SECRET'),
        {
          expiresIn: '24h'
        }
      )
      return token
    }
  }

}




function generateOtp() {
  return 1234;
  // return Math.floor(1000 + Math.random() * 9000);
}
exports.userService = new UserService();
