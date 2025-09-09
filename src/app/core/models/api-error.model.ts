export interface ApiErrorResponse {
  timestamp: string; // ISO string
  status: number;    // HTTP status code
  error: string;     // HTTP status text (e.g., "Conflict")
  message: string;   // Human-readable error message (messages.properties)
  path: string;      // Request path
}

export function isApiErrorResponse(obj: any): obj is ApiErrorResponse {
  return !!obj &&
    typeof obj === 'object' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.status === 'number' &&
    typeof obj.error === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.path === 'string';
}
