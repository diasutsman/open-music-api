const ClientError = require('./ClientError');
/**
 * NotFoundError as custom error when there is not found error
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
