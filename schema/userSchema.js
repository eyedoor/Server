const Joi = require('joi');

const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
});

module.exports = schema;