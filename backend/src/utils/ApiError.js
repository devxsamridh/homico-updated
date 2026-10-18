export class ApiError extends Error {
  constructor(statusCode, detail, fieldErrors = null) {
    super(detail);
    this.statusCode = statusCode;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

