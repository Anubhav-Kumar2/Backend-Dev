const pick = (object, keys) => {
  return keys.reduce((result, key) => {
    if (object && object[key] !== undefined) {
      result[key] = object[key];
    }
    return result;
  }, {});
};

const validateRequest = (schema) => (req, res, next) => {
  const validKeys = ['body', 'query', 'params'];
  const data = pick(req, validKeys);
  const validatedData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (schema[key]) {
      const result = schema[key].validate(value, { abortEarly: false });
      if (result.error) {
        return res.status(400).json({
          success: false,
          message: result.error.details[0].message
        });
      }
      validatedData[key] = result.value;
    }
  });

  Object.assign(req, validatedData);
  next();
};

module.exports = validateRequest;
