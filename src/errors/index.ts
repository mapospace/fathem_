export class FathemError extends Error {
  public readonly statusCode?: number;
  public readonly requestId?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode?: number, requestId?: string, details?: unknown) {
    super(message);
    this.name = 'FathemError';
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.details = details;
    Object.setPrototypeOf(this, FathemError.prototype);
  }
}

export class FathemAuthenticationError extends FathemError {
  constructor(message: string, requestId?: string) {
    super(message, 401, requestId);
    this.name = 'FathemAuthenticationError';
    Object.setPrototypeOf(this, FathemAuthenticationError.prototype);
  }
}

export class FathemRateLimitError extends FathemError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, requestId?: string) {
    super(message, 429, requestId);
    this.name = 'FathemRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, FathemRateLimitError.prototype);
  }
}

export class FathemNotFoundError extends FathemError {
  constructor(message: string, requestId?: string) {
    super(message, 404, requestId);
    this.name = 'FathemNotFoundError';
    Object.setPrototypeOf(this, FathemNotFoundError.prototype);
  }
}

export class FathemConflictError extends FathemError {
  constructor(message: string, requestId?: string) {
    super(message, 409, requestId);
    this.name = 'FathemConflictError';
    Object.setPrototypeOf(this, FathemConflictError.prototype);
  }
}

export class FathemValidationError extends FathemError {
  constructor(message: string, details?: unknown, requestId?: string) {
    super(message, 400, requestId, details);
    this.name = 'FathemValidationError';
    Object.setPrototypeOf(this, FathemValidationError.prototype);
  }
}

export class FathemNetworkError extends FathemError {
  constructor(message: string, details?: unknown) {
    super(message, undefined, undefined, details);
    this.name = 'FathemNetworkError';
    Object.setPrototypeOf(this, FathemNetworkError.prototype);
  }
}
