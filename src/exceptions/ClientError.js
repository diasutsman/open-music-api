/**
 * ClientError as custom error when there is a client error
 */
class ClientError extends Error {
  /**
   * @param {string} message
   * @param {number} code
   */
  constructor(message, code = 400) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

module.exports = ClientError;
