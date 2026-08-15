export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message = 'Petición inválida', errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'No autorizado') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acceso denegado') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflicto de datos') {
    return new ApiError(409, message);
  }

  static internal(message = 'Error interno del servidor') {
    return new ApiError(500, message);
  }
}

export default ApiError;