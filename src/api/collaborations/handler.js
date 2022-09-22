/**
 * Import necessary modules
 * @typedef { import('@hapi/hapi') } Hapi
 * @typedef { import('@hapi/jwt') } Jwt
 * @typedef { import('@hapi/hapi').Request } Hapi.Request
 * @typedef { import('@hapi/hapi').ResponseToolkit } Hapi.ResponseToolkit
 * @typedef { import('@hapi/hapi').ResponseObject } Hapi.ResponseObject
 *
 * @typedef {
 *    import('../../services/postgres/CollaborationsService')
 * } CollaborationsService
 * @typedef {
 *    import('../../services/postgres/PlaylistsService')
 * } PlaylistsService
 * @typedef {
 *    import('../../validator/collaborations/index')
 * } CollaborationsValidator
 */

/**
 * Collaboration handler that will be used to handle collaboration
 */
class CollaborationsHandler {
  /**
   * Collaboration handler constructor
   * @param {Col} collabsService
   * @param {PlaylistsService} playlistService
   * @param {*} validator
   */
  constructor(collabsService, playlistService, validator) {
    this._collabsService = collabsService;
    this._playlistService = playlistService;
    this._validator = validator;

    this.postCollabHandler = this.postCollabHandler.bind(this);
    this.deleteCollabHandler = this.deleteCollabHandler.bind(this);
  }

  /**
   * Handler for post collaboration
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async postCollabHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId =
      await this._collabsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  /**
   * Handle for delete collaboration
   * @param {Hapi.Request} request
   * @return {Hapi.ResponseObject}
   */
  async deleteCollabHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collabsService.deleteCollaboration(
        playlistId, userId, credentialId,
    );

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
