const ClientError = require('./ClientError');

/**
 * Class representing an authorization error.
 */
class AuthorizationError extends ClientError {
  /**
   * Create an authorization error.
   * @param {String} message
   */
  constructor(message) {
    super(message, 403);
    this.name = this.constructor.name;
  }
}

module.exports = AuthorizationError;
