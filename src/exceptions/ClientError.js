/**
 * ClientError as custom error when client error
 */
class ClientError extends Error {
  /**
   *
   * @param {*} message
   * @param {*} code
   */
  constructor(message, code = 400) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

module.exports = ClientError;
