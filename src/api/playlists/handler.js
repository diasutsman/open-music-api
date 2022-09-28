const autoBind = require('auto-bind');

/**
 * Playlists handler that will be used to handle playlists routes
 */
class PlaylistsHandler {
  /**
   * Playlists handler constructor
   * @param {PlaylistsService} playlistService
   * @param {PlaylistsActivitiesService} playlistActivitiesService
   * @param {PlaylistsValidator} validator
   */
  constructor(playlistService, playlistActivitiesService, validator) {
    this._playlistService = playlistService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Post playlist handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const {name} = request.payload;

    const {id: credentialId} = request.auth.credentials;

    const playlistId =
      await this._playlistService.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);

    return response;
  }

  /**
   * Get playlists handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async getPlaylistsHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {playlists, cache} = await this._playlistService.getPlaylists(
        credentialId,
    );

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });

    cache && response.headers('X-Data-Source', cache);

    return response;
  }

  /**
   * Delete playlist by id handler
   * @param {Hapi.Request} request
   * @return {Hapi.ResponseObject}
   */
  async deletePlaylistByIdHandler(request) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId);
    await this._playlistService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  /**
   * Post song to playlist handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);
    const {id} = request.params;
    const {songId} = request.payload;

    const {id: credentialId} = request.auth.credentials;
    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistService.addSongToPlaylistById(id, songId);

    this._playlistActivitiesService.addPlaylistActivity(
        id, songId, credentialId, 'add',
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);

    return response;
  }

  /**
   * Get songs from playlist handler
   * @param {Hapi.Request} request
   * @return {Hapi.ResponseObject}
   */
  async getSongsFromPlaylistHandler(request) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistService.getPlaylistSongsById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  /**
   * Delete song from playlist handler
   * @param {Hapi.Request} request
   * @return {Hapi.ResponseObject}
   */
  async deleteSongFromPlaylistHandler(request) {
    const {id} = request.params;
    const {songId} = request.payload;

    const {id: credentialId} = request.auth.credentials;
    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistService.deletePlaylistSongsById(id, songId);

    this._playlistActivitiesService.addPlaylistActivity(
        id, songId, credentialId, 'delete',
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  /**
   * Get activities from playlist handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async getActivitiesFromPlaylistHandler(request, h) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const {activities, cache} =
      await this._playlistActivitiesService.getPlaylistActivities(
          playlistId,
      );

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });

    cache && response.header('X-Data-Source', cache);

    return response;
  }
}

module.exports = PlaylistsHandler;
