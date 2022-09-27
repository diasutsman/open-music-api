const autoBind = require('auto-bind');

/**
 * ExportsHandler class
 */
class ExportsHandler {
  /**
   * ExportsHandler class constructor
   * @param {ProducerService} producerService
   * @param {PlaylistsService} playlistsService
   * @param {PlaylistsValidator} validator
   */
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * For handling POST request to /export/playlists/{playlistId} endpoint
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postExportPlaylistByIdHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const {playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage(
        `export:playlists`, JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
