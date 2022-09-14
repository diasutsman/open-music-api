const ClientError = require('./ClientError');
/**
 * NotFoundError as custom error when not found error
 */
class NotFoundError extends ClientError {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message, 404);
    this.name = this.constructor.name;
  }
}

module.exports = NotFoundError;
