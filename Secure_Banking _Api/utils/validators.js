const Joi = require('joi');

const registerValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  })
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

const amountValidation = {
  body: Joi.object({
    amount: Joi.number().min(0.01).required()
  })
};

const transferValidation = {
  body: Joi.object({
    toAccountId: Joi.string().required(),
    amount: Joi.number().min(0.01).required()
  })
};

module.exports = {
  registerValidation,
  loginValidation,
  amountValidation,
  transferValidation
};
