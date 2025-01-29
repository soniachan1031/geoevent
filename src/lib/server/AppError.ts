export default class AppError extends Error {
  constructor(public statusCode: number = 500, public message: string) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor); // Capture stack trace

    // Set the prototype to be AppError instead of Error
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
