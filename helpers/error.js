class ErrorHandler extends Error {
  constructor(statusCode, message, actualError) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.actualError = actualError;
  }
}

module.exports = ErrorHandler;