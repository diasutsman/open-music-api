const {nanoid} = require('nanoid');
const {Pool} = require('pg');

/**
 * AlbumsLikesService class
 */
class AlbumsLikesService {
  /**
   * AlbumsLikesService class constructor
   * @param {CacheService} cacheService
   */
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  /**
   * For toggle likes
   * @param {String} userId
   * @param {String} albumId
   */
  async toggleLikes(userId, albumId) {
    const isLiked = await this._checkIfLiked(userId, albumId);

    await (
      isLiked ? this._dislike(userId, albumId) : this._like(userId, albumId)
    );

    await this._cacheService.delete(`likes:${albumId}`);
  }

  /**
   *
   * @param {String} id
   * @return {Promise<{likes: number, cache}>}
   */
  async getAlbumLikes(id) {
    try {
      const likes = await this._cacheService.get(`likes:${id}`);

      return {likes: JSON.parse(likes), cache: 'cache'};
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const {rowCount: likes} = await this._pool.query(query);

      await this._cacheService.set(`likes:${id}`, JSON.stringify(likes));

      return {likes};
    }
  }

  /**
   * Add like from album
   * @param {String} userId
   * @param {String} albumId
   */
  async _like(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };
    await this._pool.query(query);
  }

  /**
   * Remove like from album
   * @param {String} userId
   * @param {String} albumId
   */
  async _dislike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    await this._pool.query(query);
  }

  /**
   * Check if the albums has been liked by the user
   * @param {String} userId
   * @param {String} albumId
   * @return {Boolean}
   */
  async _checkIfLiked(userId, albumId) {
    const query = {
      text: `SELECT * FROM user_album_likes 
      WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return !!result.rowCount;
  }
}

module.exports = AlbumsLikesService;
