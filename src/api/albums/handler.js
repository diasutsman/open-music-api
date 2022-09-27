const autoBind = require('auto-bind');

/**
 * AlbumsHandler for handling request to /albums endpoint
 */
class AlbumsHandler {
  /**
     *
     * @param {AlbumsService} albumsService
     * @param {StorageService} storageService
     * @param {AlbumsValidator} validator
     */
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService
    this._validator = validator;

    autoBind(this);
  }

  /**
   * For handling POST request to /albums endpoint
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumsPayload(request.payload);

    const { name, year } = request.payload;
    const albumId = await this._albumsService.addAlbum({ name, year });

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
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);
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
    const { id } = request.params;

    this._validator.validateAlbumsPayload(request.payload);

    await this._albumsService.editAlbumById(id, request.payload);

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
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id } = request.params
    const { cover } = request.payload

    this._validator.validateImageHeaders(cover.hapi.headers)

    const filename = await this._storageService.writeFile(cover, cover.hapi)

    await this._albumsService.addAlbumCoverById(
      id, `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/covers/${filename}`
    )

    const response = h.response({
      "status": "success",
      "message": "Sampul berhasil diunggah"
    })

    response.code(201)
    return response
  }
}

module.exports = AlbumsHandler;
