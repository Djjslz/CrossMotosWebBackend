import ApiError from '../utils/ApiError.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación de datos';
    errors = Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un registro con ese valor';
  }

  const payload = { success: false, message };
  if (errors) payload.errors = errors;

  res.status(statusCode).json(payload);
}

export default errorHandler;