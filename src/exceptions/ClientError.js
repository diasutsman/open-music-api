class ClientError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

module.exports = ClientError;
