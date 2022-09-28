const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

/**
 * Playlists activities service.
 */
class PlaylistsActivitiesService {
  /**
   * Playlists activities service constructor.
   * @param {CacheService} cacheService
   */
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  /**
   * Add playlist activity.
   * @param {String} playlistId
   * @param {String} songId
   * @param {String} userId
   * @param {String} action
   */
  async addPlaylistActivity(playlistId, songId, userId, action) {
    const id = `playlist_activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlist_song_activities 
             VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan playlist activity');
    }

    await this._cacheService.delete(`playlist-activities:${playlistId}`);
  }

  /**
   * Get playlist activities.
   * @param {String} playlistId
   * @return {Promise<any[]>}
   */
  async getPlaylistActivities(playlistId) {
    try {
      const playlistActivities = await this._cacheService.get(
          `playlist-activities:${playlistId}`,
      );
      return {
        activities: JSON.parse(playlistActivities),
        cache: 'cache',
      };
    } catch (error) {
      const query = {
        text: `SELECT playlist_song_activities.*, users.username, songs.title 
        FROM playlist_song_activities 
        LEFT JOIN users ON playlist_song_activities.user_id = users.id 
        LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
        WHERE playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }

      await this._cacheService.set(
          `playlist-activities:${playlistId}`, JSON.stringify(result.rows),
      );

      return {activities: result.rows};
    }
  }
}

module.exports = PlaylistsActivitiesService;
