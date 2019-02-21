const Joi = require('joi');

const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required()
});

module.exports = schema;