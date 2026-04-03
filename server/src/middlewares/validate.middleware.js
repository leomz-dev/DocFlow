/**
 * Returns a middleware that validates req.body against a Zod schema.
 * Responds 422 with field-level errors if validation fails.
 *
 * @param {import('zod').ZodSchema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({ error: 'Datos inválidos', errors });
    }
    req.body = result.data; // use parsed (and coerced) data
    next();
  };
}

module.exports = validate;
