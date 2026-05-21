/**
 * Helper: JSON response with proper headers.
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Helper: error response.
 */
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * Helper: generate a UUID for new records.
 */
export function generateId() {
  return crypto.randomUUID();
}
