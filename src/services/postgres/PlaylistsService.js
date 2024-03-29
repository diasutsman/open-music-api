const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

/**
 * Playlists service.
 */
class PlaylistsService {
  /**
   * Constructor.
   * @param {PlaylistsSongsService} playlistsSongsService
   * @param {CollaborationsService} collaborationsService
   * @param {CacheService} cacheService
   */
  constructor(playlistsSongsService, collaborationsService, cacheService) {
    this._pool = new Pool();
    this._playlistsSongsService = playlistsSongsService;
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  /**
   * Add new playlist.
   * @param {String} name
   * @param {String} owner
   * @return {Promise<String>}
   */
  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._deletePlaylistsCache(owner);
    return result.rows[0].id;
  }

  /**
   * Get all playlists.
   * @param {String} owner
   * @return {Promise<any[]>}
   */
  async getPlaylists(owner) {
    try {
      const result = await this._cacheService.get(`playlists:${owner}`);
      return {playlists: JSON.parse(result), cache: 'cache'};
    } catch (error) {
      const query = {
        text: `
        SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON 
        collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
        values: [owner],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(
          `playlists:${owner}`, JSON.stringify(result.rows),
      );
      return {playlists: result.rows};
    }
  }

  /**
   * Delete playlist by id.
   * @param {String} id
   */
  async deletePlaylistById(id) {
    const query = {
      text: `DELETE FROM playlists
      WHERE id = $1 RETURNING id, owner`,
      values: [id],
    };

    const result = await this._pool.query(query);

    const {owner} = result.rows[0];

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
    }

    await this._deletePlaylistsCache(owner);
    await this._deleteSongsCache(id);
    await this._cacheService.delete(`playlist-activities:${id}`);
  }

  /**
   * Verify playlist owner.
   * @param {String} id
   * @param {String} owner
   */
  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    // Query to database
    const result = await this._pool.query(query);

    // If playlist not exists then throws NotFoundError
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const note = result.rows[0];

    // If the playlist does not own this notes then throwsAuthorizationError
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /**
   * Verify playlist access.
   * @param {String} playlistId
   * @param {String} userId
   */
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      await this._collaborationsService.verifyCollaborator(
          playlistId, userId,
      );
    }
  }

  /**
   * Add song to playlist.
   * @param {String} id
   * @param {String} songId
   */
  async addSongToPlaylistById(id, songId) {
    await this._playlistsSongsService.addPlaylistSong(id, songId);
    await this._deleteSongsCache(id);
  }

  /**
   * Get songs from playlist.
   * @param {String} id
   * @return {Promise<any[]>}
   */
  async getPlaylistSongsById(id) {
    try {
      const playlist = JSON.parse(
          await this._cacheService.get(`playlistsongs:${id}`),
      );
      return {playlist, cache: 'cache'};
    } catch (error) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username 
        FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1`,
        values: [id],
      };

      const result = await this._pool.query(query);

      const [playlist] = result.rows;

      playlist.songs = (await this._pool.query({
        text: `SELECT songs.id, songs.title, songs.performer FROM songs
              LEFT JOIN playlists_songs ON playlists_songs.song_id = songs.id
              WHERE playlists_songs.playlist_id = $1
              GROUP BY songs.id`,
        values: [id],
      })).rows;

      await this._cacheService.set(
          `playlistsongs:${id}`,
          JSON.stringify(playlist),
      );

      return {playlist};
    }
  }

  /**
   * Delete song from playlist.
   * @param {String} id
   * @param {String} songId
   */
  async deletePlaylistSongsById(id, songId) {
    await this._playlistsSongsService.deletePlaylistSong(id, songId);
    await this._deleteSongsCache(id);
  }

  /**
   * Delete playlist cache of given owner
   * @param {string} owner
   * @return {Promise<number>}
   */
  _deletePlaylistsCache(owner) {
    return this._cacheService.delete(`playlists:${owner}`);
  }

  /**
   * Delete songs playlist cache by given id
   * @param {string} id
   * @return {Promise<number>}
   */
  _deleteSongsCache(id) {
    return this._cacheService.delete(`playlistsongs:${id}`);
  }
}

module.exports = PlaylistsService;
