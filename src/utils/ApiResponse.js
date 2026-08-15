export function successResponse(message, data = null, pagination = undefined) {
  const payload = { success: true, message };
  if (data !== null && data !== undefined) payload.data = data;
  if (pagination) payload.pagination = pagination;
  return payload;
}

export default { successResponse };