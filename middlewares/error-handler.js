const ResponseMessage = require('../helpers/responseMessages');
exports.apiErrorHandler = (err, req, res, next) => {
	const { statusCode, message, actualError } = err;
	logger.error(message)
	if (actualError) {
		logger.error(actualError);
	}
	return res.status(statusCode || 500).json({
		status: "error",
		message: message || 'Somthing went wrong on server.',
		data: []//error: actualError ? actualError.message : null
	});
}

exports.pageNotFound = ('*', (req, res, next) => {
	next(new ErrorHandler(404, `Invalid API :: ${req.method} : ${req.url}`, 'Error:may be Controller file not included in server.js file'));
});