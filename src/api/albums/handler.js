const autoBind = require('auto-bind');

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

    autoBind(this);
  }

  /**
   * For handling POST request to /albums endpoint
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postAlbumHandler(request, h) {
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
  }

  /**
   * For handling GET request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async getAlbumByIdHandler(request, h) {
    const {id} = request.params;

    const album = await this.service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  /**
   * For handling PUT request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async putAlbumByIdHandler(request, h) {
    const {id} = request.params;

    this.validator.validateAlbumsPayload(request.payload);

    await this.service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  /**
   * For handling DELETE request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async deleteAlbumByIdHandler(request, h) {
    const {id} = request.params;

    await this.service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
