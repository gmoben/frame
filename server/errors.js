export class ModelError extends Error {
  constructor(msg) {
    super(msg);
    this.message = msg;
    this.name = 'ModelError';
  }
}

export class AppError extends Error {
  constructor(msg) {
    super(msg);
    this.message = msg;
    this.name = 'AppError';
  }
}

export default {ModelError, AppError};
