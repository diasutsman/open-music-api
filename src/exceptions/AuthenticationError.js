const ClientError = require('./ClientError');

/**
 * Class representing an authentication error.
 */
class AuthenticationError extends ClientError {
  /**
   * Create an authentication error.
   * @param {String} message
   */
  constructor(message) {
    super(message, 401);
    this.name = this.constructor.name;
  }
}

module.exports = AuthenticationError;
