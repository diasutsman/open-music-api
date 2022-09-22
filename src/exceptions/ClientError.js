/**
 * ClientError as custom error when there is a client error
 */
class ClientError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

module.exports = ClientError;
