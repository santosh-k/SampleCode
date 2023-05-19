const path = require('path');
// declare function require(name:string);

const config = require("config")
const url = config.get("url.site_url")
const emailConfig = config.get('email');
const { EmailTemplate } = require('email-templates');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(config.get("SECRET.SENDGRID_API_KEY"))
// const Twillo = require('./twillo');

const Email = {
    welcome(user) {
        if (user.email) {
            let templateDir = path.join('app/global/templates', 'emails', 'welcome-email');
            let welcomeEmail = new EmailTemplate(templateDir);
            welcomeEmail.render({ user: user, activate_url: `${url.API}/auth/activate/${user.uuid}` }, (err, result) => {
                transport.sendMail(
                    {
                        from: eemailConfig.global.from,
                        to: user.email,
                        subject: eemailConfig.welcome.subject,
                        html: result.html,
                    }, (err, info) => {
                        // some error occoured...
                        console.log(err);
                    }
                );
            });
        }
    },
    password_reset(user, password) {
        if (user.email) {
            let templateDir = path.join('app/global/templates', 'emails', 'password-reset-email');
            let passwordResetEmail = new EmailTemplate(templateDir);
            passwordResetEmail.render({ user: user, login_url: `${url.FE}/#/auth/login`, password: password }, (err, result) => {
                transport.sendMail(
                    {
                        from: eemailConfig.global.from,
                        to: user.email,
                        subject: eemailConfig.password_reset.subject,
                        html: result.html,
                    }, (err, info) => {
                        // some error occoured...
                    }
                );
            });
        }
        if (user.phone_verified) {
            // Twillo.password_reset_notification(user.phone);
        }

    },
     sendMail(data) {
        // sgMail.sendMail({
        //   To: data.to,
        //   from: config.get("SECRET.SENDGRID_SEND_EMAIL"),
        //   subject: data.subject,
        //   html: data.content
        // })
        sgMail.send({
            To: data.to,
            from: config.get("SECRET.SENDGRID_SEND_EMAIL"),
            subject: data.subject,
            html: data.content
          })
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
        return true

      }
};
module.exports = Email;
