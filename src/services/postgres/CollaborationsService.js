const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

/**
 * Collaborations service.
 */
class CollaborationsService {
  /**
   * Collaborations service constructor.
   * @param {UsersService} usersService
   * @param {CacheService} cacheService
   */
  constructor(usersService, cacheService) {
    this._pool = new Pool();
    this._usersService = usersService;
    this._cacheService = cacheService;
  }

  /**
   * Add collaboration.
   * @param {String} playlistId
   * @param {String} userId
   * @return {Promise<String>}
   */
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    await this._usersService.verifyUserExist(userId);

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    await this._cacheService.delete(`playlists:${userId}`);

    return result.rows[0].id;
  }

  /**
   * Delete collaboration.
   * @param {String} playlistId
   * @param {String} userId
   */
  async deleteCollaboration(playlistId, userId) {
    await this._usersService.verifyUserExist(userId);

    const query = {
      text: `DELETE FROM collaborations 
             WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }

    await this._cacheService.delete(`playlists:${userId}`);
  }

  /**
   * Verify collaboration.
   * @param {String} playlistId
   * @param {String} userId
   */
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `SELECT * FROM collaborations 
             WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = CollaborationsService;
