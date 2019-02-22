const Joi = require('joi');

const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

module.exports = schema;