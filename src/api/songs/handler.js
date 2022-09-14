const ClientError = require('../../exceptions/ClientError');
const {serverErrorResponse, clientErrorResponse} = require('../../utils');

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
   *
   * @param {Hapi} request
   * @param {*} h
   * @returns
   */
  async postSongHandler(request, h) {
    try {
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
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }

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
   *
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getSongByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const song = await this.service.getSongById(id);

      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }

  /**
   *
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async putSongByIdHandler(request, h) {
    try {
      this.validator.validateSongsPayload(request.payload);

      const {id} = request.params;
      await this.service.editSongById(id, request.payload);

      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      };
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }

  /**
   *
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deleteSongByIdHandler(request, h) {
    try {
      const {id} = request.params;
      await this.service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }
}

module.exports = SongsHandler;
