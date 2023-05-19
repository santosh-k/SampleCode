const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("config");
const { signToken } = require("../helpers/bcrypt");

class HttpRequest {
    constructor() { }
    // making get request
    async get(url) {
        try {
            const response = await axios.get(url, {
                headers: this.getHeaders(),
            });
            return response;
        } catch (error) {
            logger.error(error);
            if (!error.response) {
                return {
                    status: 500,
                    data: {
                        status: "error",
                        message: "Server not running!!!",
                        data: []
                    }
                }
            }
            return error.response;
        }
    }
    // making delete request
    async delete(url) {
        try {
            const response = await axios.delete(url, {
                headers: this.getHeaders(),
            });
            return response;
        } catch (error) {
            logger.error(error);
            if (!error.response) {
                return {
                    status: 500,
                    data: {
                        status: "error",
                        message: "Server not running!!!",
                        data: []
                    }
                }
            }
            return error.response;
        }
    }
    // making post request
    async post(url, data) {
        try {
            const response = await axios.post(url, data, {
                headers: this.getHeaders(),
            });
            return response;
        } catch (error) {
            logger.error(error);
            if (!error.response) {
                return {
                    status: 500,
                    data: {
                        status: "error",
                        message: "Server not running!!!",
                        data: []
                    }
                }
            }
            return error.response;
        }
    }
    // making put request
    async put(url, data) {
        try {
            const response = await axios.put(url, data, {
                headers: this.getHeaders(),
            });
            return response;
        } catch (error) {
            logger.error(error);
            if (!error.response) {
                return {
                    status: 500,
                    data: {
                        status: "error",
                        message: "Server not running!!!",
                        data: []
                    }
                }
            }
            return error.response;;
        }
    }

    getHeaders() {
        let headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Access-Control-Allow-Origin': '*',
            'content-type': 'application/json',
        }
        const access_token = this.getAccessToken();
        if (access_token) {
            headers["Authorization"] = access_token;
        }
        return headers;
    }

    getAccessToken() {
        let token = jwt.sign({
            adminData: "Admin"
        }, config.get("SECRET.ADMIN_JWT_SECRET"));
        return token;
    }
    // getAccessToken() {
    //     signToken({
    //         id: "ccnsdd%$%#$%^Ttfasda64^^%77654538979ijjxbs"
    //     })
    // }
}

module.exports = HttpRequest;