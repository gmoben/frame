export class ModelError extends Error {
  constructor(responseCode, msg) {
    super(msg);
    this.name = "ModelError";
    this.responseCode = responseCode;
  }
}

export class AppError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "AppError";
  }
}

export default {ModelError, AppError}
