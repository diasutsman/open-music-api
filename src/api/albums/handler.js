const {serverErrorResponse, clientErrorResponse} = require('../../utils');
const ClientError = require('../../exceptions/ClientError');
/**
 * AlbumsHandler for handling request to /albums endpoint
 */
class AlbumsHandler {
  /**
     *
     * @param {AlbumsService} service
     * @param {AlbumsValidator} validator
     */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  /**
   * For handling POST request to /albums endpoint
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postAlbumHandler(request, h) {
    try {
      this.validator.validateAlbumsPayload(request.payload);

      const {name, year} = request.payload;
      const albumId = await this.service.addAlbum({name, year});

      const response = h.response({
        status: 'success',
        data: {
          albumId,
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

  /**
   * For handling GET request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async getAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;

      const album = await this.service.getAlbumById(id);

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }

  /**
   * For handling PUT request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async putAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;

      this.validator.validateAlbumsPayload(request.payload);

      await this.service.editAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
      };
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }

  /**
   * For handling DELETE request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async deleteAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;

      await this.service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      return error instanceof ClientError ?
        clientErrorResponse(error, h) :
        serverErrorResponse(error, h);
    }
  }
}

module.exports = AlbumsHandler;
