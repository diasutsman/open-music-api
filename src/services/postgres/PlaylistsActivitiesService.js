const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

/**
 * Playlists activities service.
 */
class PlaylistsActivitiesService {
  /**
   * Playlists activities service constructor.
   */
  constructor() {
    this.pool = new Pool();
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

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan playlist activity');
    }
  }

  /**
   * Get playlist activities.
   * @param {String} playlistId
   * @return {Promise<any[]>}
   */
  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT playlist_song_activities.*, users.username, songs.title 
      FROM playlist_song_activities 
      LEFT JOIN users ON playlist_song_activities.user_id = users.id 
      LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
      WHERE playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistsActivitiesService;
