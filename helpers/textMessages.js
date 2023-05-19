

let textMessages = {
    phone_verification(phone_number, code, callback) {
        client.sendMessage({
            to: phone_number,
            from: twilioConfig.phone,
            body: `Hello from Sparx E-Commerce\nYour verification code is ${code}`,
        }, (err, message) => {
            callback(message);
        });
    },
    password_reset_notification(phone) {
        client.sendMessage({
            to: phone,
            from: twilioConfig.phone,
            body: `Sparx-IT\nYour password has been successfully reset.`,
        }, (err, message) => {
            // 
        });
    },

    default_notification(phone, message) {
        console.log(client);
        client.sendMessage({
            to: phone,
            from: twilioConfig.phone,
            body: `e-Commerce-Hub-TM\n${message}`,
        }, (err, message) => {
            // 
        });
    }
}
module.exports = textMessages


