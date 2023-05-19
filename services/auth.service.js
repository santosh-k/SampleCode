const { User } = require("../models/user.model"); //mlw_training_plans
const authHelper = require("../helpers/bcrypt");
const { userDocumentURL } = require("../helpers/bcrypt");

class AuthService {
  constructor() {}

  async auth() {
    // throw new ErrorHandler(400, `unauthorised`)
    let user = await User.findOne({
      email: useremail,
      isDeleted: 0,
      status: 1,
    });
    if (!user) return false;
    return await authHelper.comparePassword(password, user["password"]);
  }
  async get_user(useremail) {
    let user = await User.findOne({
      email: useremail,
      isDeleted: 0,
      status: 1,
    }).select({ username: 1, password: 1, email: 1, _id: 1 });
    if (!user) return false;
    return user;
  }

  async create_user(user) {
    let userData = new User(user);
    userData.password = authHelper.generateSaltValue(userData.password);
    return await userData.save();
  }

  async authenticateService(req) {
    let {email,password} = req.body 
    let user = await User.findOne({
      email: email,
      isDeleted: 0,
      status: true,
    }).select({ password: 1, email: 1, _id: 1 });
    if (!user) return { status: false, msg: "Wrong email" };
    if (authHelper.comparePassword(password, user["password"])) {
      let token = authHelper.signServiceToken(user);
      return { token: token };
    }else{
      return { status: false, msg: "Wrong password" };
    }
  }
}
exports.authService = new AuthService();
