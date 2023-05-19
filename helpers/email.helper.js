const config = require("config");
const emailConfig = config.get("email");
const nodeMailer = require("nodemailer");

const emailHelper = {
    async admin_password_reset(mailData) {
        let transporter = nodeMailer.createTransport({
            host: emailConfig.auth.host,
            port: emailConfig.auth.port,
            secure: true,
            auth: {
                user: emailConfig.auth.user,
                pass: emailConfig.auth.pass
            }
        });
        let data  = await transporter.sendMail(mailData);
        if(data && (data.rejected).length>0){
            return data;
        } else {
            return {}
        }
    }
}

module.exports = emailHelper;