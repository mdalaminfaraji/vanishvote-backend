const Joi = require('joi');

/**
 * Validate poll creation request
 * @param {Object} poll - Poll data
 * @returns {Object} - Validation result
 */
exports.validatePoll = (poll) => {
  const schema = Joi.object({
    title: Joi.string().required().min(5).max(200).trim(),
    options: Joi.array().items(Joi.string().required().trim()).min(2).max(10).required(),
    expiresIn: Joi.string().valid('1hour', '12hours', '24hours').default('24hours'),
    hideResults: Joi.boolean().default(false),
    isPrivate: Joi.boolean().default(true)
  });

  return schema.validate(poll);
};

/**
 * Validate vote request
 * @param {Object} vote - Vote data
 * @returns {Object} - Validation result
 */
exports.validateVote = (vote) => {
  const schema = Joi.object({
    optionId: Joi.string().required()
  });

  return schema.validate(vote);
};
