export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
const issues = result.error.issues ?? result.error.errors;
    const errors = issues.map((e) => ({
      campo: e.path.join('.') || 'general',
      mensaje: e.message,
    }));
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.errors = errors;
      return next(err);
    }
    if (source === 'query') {
      for (const [key, value] of Object.entries(result.data)) req.query[key] = value;
    } else {
      req[source] = result.data;
    }
    next();
  };
}

export default validate;