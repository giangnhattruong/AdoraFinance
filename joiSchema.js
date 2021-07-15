const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.contactSchema = Joi.object({
    contact: Joi.object({
        name: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        message: Joi.string().required().escapeHTML()
    }).required()
});

module.exports.articleSchema = Joi.object({
    article: Joi.object({
        title: Joi.string().required().escapeHTML(),
        category: Joi.string().required().escapeHTML(),
        images: Joi.object(),
        description: Joi.string().required(),
        snippet: Joi.string().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});