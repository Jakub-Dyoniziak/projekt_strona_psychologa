const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().withMessage('Nieprawidłowy email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Hasło min 8 znaków')
    .matches(/[A-Z]/).withMessage('Hasło musi zawierać wielką literę')
    .matches(/[0-9]/).withMessage('Hasło musi zawierać cyfrę'),
  body('first_name').optional().isString(),
  body('last_name').optional().isString(),
];

const loginValidator = [
  body('email').isEmail(),
  body('password').exists()
];

module.exports = {
  registerValidator,
  loginValidator
};