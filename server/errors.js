class ModelError extends Error {
  constructor(responseCode, message) {
    super(message);
    this.name = "ModelError";
    this.responseCode = responseCode;
  }
}

export {ModelError};

export default {
  ModelError: ModelError
}
