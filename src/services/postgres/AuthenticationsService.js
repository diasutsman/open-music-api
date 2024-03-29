const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * Authentications service.
 */
class AuthenticationsService {
  /**
   * Authentications service constructor.
   */
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Add refresh token.
   * @param {String} token
   */
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
    await this._pool.query(query);
  }

  /**
   * Verify refresh token.
   * @param {String} token
   */
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /**
   * Delete refresh token.
   * @param {String} token
   */
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthenticationsService;
