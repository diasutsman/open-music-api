const autoBind = require('auto-bind');
const config = require('../../utils/config');
/**
 * AlbumsHandler for handling request to /albums endpoint
 */
class AlbumsHandler {
  /**
     *
     * @param {AlbumsService} albumsService
     * @param {StorageService} storageService
     * @param {AlbumsLikesService} albumsLikesService
     * @param {AlbumsValidator} validator
     */
  constructor(albumsService, storageService, albumsLikesService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumsLikesService = albumsLikesService;
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

    const {name, year} = request.payload;
    const albumId = await this._albumsService.addAlbum({name, year});

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

    const {album, cache} = await this._albumsService.getAlbumById(id);

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });

    cache && response.header('X-Data-Source', cache);

    return response;
  }

  /**
   * For handling PUT request to /albums endpoint with id
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async putAlbumByIdHandler(request, h) {
    const {id} = request.params;

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
    const {id} = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  /**
   * post album cover by id handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postAlbumCoverByIdHandler(request, h) {
    const {id} = request.params;
    const {cover} = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    await this._albumsService.addAlbumCoverById(
        id, `http://${config.app.host}:${config.app.host}/albums/${id}/covers/${filename}`,
    );

    const response = h.response({
      'status': 'success',
      'message': 'Sampul berhasil diunggah',
    });

    response.code(201);
    return response;
  }

  /**
   * post albums likes by id handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async postAlbumLikesByIdHandler(request, h) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    // will throw error if not exists
    await this._albumsService.getAlbumById(id);

    await this._albumsLikesService.toggleLikes(credentialId, id);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });

    response.code(201);

    return response;
  }

  /**
   * get album likes by id handler
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseToolkit}
   */
  async getAlbumLikesByIdHandler(request, h) {
    const {id} = request.params;
    const {likes, cache} = await this._albumsLikesService.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    cache && response.header('X-Data-Source', cache);

    return response;
  }
}

module.exports = AlbumsHandler;
