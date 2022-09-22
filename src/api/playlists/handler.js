/**
 * Import necessary modules
 * @typedef { import('@hapi/hapi') } Hapi
 * @typedef { import('@hapi/jwt') } Jwt
 * @typedef { import('@hapi/hapi').Request } Hapi.Request
 * @typedef { import('@hapi/hapi').ResponseToolkit } Hapi.ResponseToolkit
 * @typedef { import('@hapi/hapi').ResponseObject } Hapi.ResponseObject
 *
 * @typedef {
 *    import('../../services/postgres/PlaylistsService')
 * } PlaylistsService
 * @typedef {
 *    import('../../services/postgres/PlaylistsActivitiesService')
 * } PlaylistsActivitiesService
 * @typedef { import('../../validator/playlists/index') } PlaylistsValidator
 */

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
    this.playlistService = playlistService;
    this.playlistActivitiesService = playlistActivitiesService;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Post playlist handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async postPlaylistHandler(request, h) {
    this.validator.validatePostPlaylistPayload(request.payload);
    const {name} = request.payload;

    const {id: credentialId} = request.auth.credentials;

    const playlistId =
      await this.playlistService.addPlaylist(name, credentialId);

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
   * @return {Hapi.ResponseObject}
   */
  async getPlaylistsHandler(request) {
    const {id: credentialId} = request.auth.credentials;
    const playlists = await this.playlistService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  /**
   * Delete playlist by id handler
   * @param {Hapi.Request} request
   * @return {Hapi.ResponseObject}
   */
  async deletePlaylistByIdHandler(request) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this.playlistService.verifyPlaylistOwner(id, credentialId);
    await this.playlistService.deletePlaylistById(id);

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
    this.validator.validatePostPlaylistSongPayload(request.payload);
    const {id} = request.params;
    const {songId} = request.payload;

    const {id: credentialId} = request.auth.credentials;
    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    await this.playlistService.addSongToPlaylistById(id, songId);

    this.playlistActivitiesService.addPlaylistActivity(
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

    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.playlistService.getPlaylistSongsById(id);

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
    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    await this.playlistService.deletePlaylistSongsById(id, songId);

    this.playlistActivitiesService.addPlaylistActivity(
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
   * @return {Hapi.ResponseObject}
   */
  async getActivitiesFromPlaylistHandler(request) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const activities =
      await this.playlistActivitiesService.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
