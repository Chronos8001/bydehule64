import type { ApiErrorBody, FieldError } from '../types.js';

type ErrorCode = ApiErrorBody['error']['code'];

/** Erreur métier transportant son statut HTTP et son code stable. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields: FieldError[] | undefined;

  constructor(status: number, code: ErrorCode, message: string, fields?: FieldError[]) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  static notFound(message = 'Ressource introuvable.'): HttpError {
    return new HttpError(404, 'NOT_FOUND', message);
  }

  static validation(message: string, fields?: FieldError[]): HttpError {
    return new HttpError(400, 'VALIDATION_ERROR', message, fields);
  }

  toBody(): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fields ? { fields: this.fields } : {}),
      },
    };
  }
}
