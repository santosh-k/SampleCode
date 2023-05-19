const jwt = require("jsonwebtoken");
const config = require('config')
const secret = config.get("SECRET")
const RM = require('../helpers/responseMessages')
module.exports.adminValidateToken = (req, res, next) => {
	const token = req.headers.authorization || req.headers.guest;
	if (!token) throw new ErrorHandler(403, RM.TOKEN_RQD)
	jwt.verify(
		token,
		secret.ADMIN_JWT_SECRET,
		function (err, decodedToken) {
			if (err) {
				throw new ErrorHandler(401, RM.INVALID_TOKEN, err)
			} else {
				req.user = decodedToken;
				next();
			}
		}
	);
};