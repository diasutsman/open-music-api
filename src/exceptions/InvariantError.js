const ClientError = require('./ClientError');
/**
 * InvariantError as custom error when invariant error
 */
class InvariantError extends ClientError {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvariantError;
