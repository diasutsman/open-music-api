const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = this.constructor.name;
  }
}

module.exports = NotFoundError;
