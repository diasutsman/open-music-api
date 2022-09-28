const autoBind = require('auto-bind');

/**
 * SongsHandler for handling request to /songs endpoint
 */
class SongsHandler {
  /**
     *
     * @param {SongsService} service
     * @param {SongsValidator} validator
     */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }
  /**
   * For handling POST request to /songs endpoint
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postSongHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }
  /**
   * For handling GET request to /songs endpoint
   * @param {Hapi.Request} request
   * @return {Hapi.ResponseToolkit}
   */
  async getSongsHandler(request) {
    const {title, performer} = request.query;

    const songs = await this._service.getSongs({title, performer});
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }
  /**
   * For handling GET request to /songs endpoint with songId
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async getSongByIdHandler(request, h) {
    const {id} = request.params;
    const {song, cache} = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    cache && response.header('X-Data-Source', cache);

    return response;
  }

  /**
   * For handling PUT request to /songs endpoint with songId
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async putSongByIdHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);

    const {id} = request.params;
    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  /**
   * For handling DELETE request to /songs endpoint with songId
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async deleteSongByIdHandler(request, h) {
    const {id} = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
