class ResponseMessage {
    ERROR = 'some error occurred'
    EMPTY_CONTENT = 'you must provide valid data and it must not be empty.';
    INVALID_CONTENT = 'you must specify content type and it must be application/json';
    USER_EXIST = 'user already registered in System';
    USER_NOT_EXIST = 'user account does not exist in system';
    TOKEN_RQD = 'token required';
    INVALID_TOKEN = 'token is invalid, please use a valid token';
};
module.exports = new ResponseMessage();
