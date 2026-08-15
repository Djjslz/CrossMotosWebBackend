export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        campo: e.path.join('.') || 'general',
        mensaje: e.message,
      }));
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.errors = errors;
      return next(err);
    }
    req[source] = result.data;
    next();
  };
}

export default validate;