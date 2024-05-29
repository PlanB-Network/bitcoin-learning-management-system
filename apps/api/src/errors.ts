export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);

    this.status = status;
  }

  public toJSON() {
    return {
      status: this.status,
      message: this.message,
    };
  }
}

export class Unauthorized extends HttpError {
  constructor(message?: string) {
    super(401, message ?? 'Unauthorized');
  }
}

export class BadRequest extends HttpError {
  constructor(message?: string) {
    super(400, message ?? 'Bad Request');
  }
}

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(500, message ?? 'Internal Server Error');
  }
}
