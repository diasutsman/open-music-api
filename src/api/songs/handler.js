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
    this.service = service;
    this.validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }
  /**
   * For handling POST request to /songs endpoint
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postSongHandler(request, h) {
    this.validator.validateSongsPayload(request.payload);

    const {title, year, performer,
      genre, duration, albumId} = request.payload;
    const songId = await this.service.addSong(
        {title, year, performer, genre, duration, albumId});

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

    const songs = await this.service.getSongs({title, performer});
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
    const song = await this.service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  /**
   * For handling PUT request to /songs endpoint with songId
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async putSongByIdHandler(request, h) {
    this.validator.validateSongsPayload(request.payload);

    const {id} = request.params;
    await this.service.editSongById(id, request.payload);

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
    await this.service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
