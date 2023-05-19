
const Email = require('./emails');

const events = require('events');

const eventEmitter = new events.EventEmitter();
eventEmitter.on('welcome', (user) => {
    logger.info('info', `sending welcome email to ${user.email}`);
    Email.welcome(user);
});
eventEmitter.on('forgotPassword', (user, password, uuid) => {
    logger.info('info', `sending forgotPassword email to ${user.email}`);
    Email.password_reset(user, password);
});

module.exports = eventEmitter;
