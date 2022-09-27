const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * Playlists service.
 */
class PlaylistsSongsService {
  /**
   * Constructor.
   * @param {SongsService} songsService
   */
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  /**
   * Add song to playlist.
   * @param {String} playlistId
   * @param {String} songId
   */
  async addPlaylistSong(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    await this._songsService.getSongById(songId);

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist');
    }
  }

  /**
   * Delete song from playlist.
   * @param {String} playlistId
   * @param {String} songId
   */
  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlists_songs 
             WHERE playlist_id = $1 AND song_id = $2`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus lagu dari playlist');
    }
  }
}

module.exports = PlaylistsSongsService;
