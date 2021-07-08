const { contactSchema } = require('./joiSchema');
const ExpressError = require('./ultils/ExpressError');

module.exports.validateContact = (req, res, next) => {
    const { error } = contactSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

