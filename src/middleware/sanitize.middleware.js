function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v));
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$')) continue;
      const newKey = key.includes('.') ? key.replace(/\./g, '_') : key;
      clean[newKey] = sanitizeValue(value[key]);
    }
    return clean;
  }
  return value;
}

export function sanitizeMiddleware(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        const newKey = key.includes('.') ? key.replace(/\./g, '_') : key;
        req.query[newKey] = sanitizeValue(req.query[key]);
        delete req.query[key];
      } else {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    }
  }
  next();
}

export default sanitizeMiddleware;