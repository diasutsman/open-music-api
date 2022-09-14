const AlbumsService = require("../../services/postgres/AlbumsService");
const { serverErrorResponse } = require("../../utils");
const ClientError = require("../../exceptions/ClientError");
const AlbumsValidator = require("../../validator/albums/index");

class AlbumsHandler {

    /**
     * 
     * @param {AlbumsService} service 
     * @param {AlbumsValidator} validator
     */
    constructor(service, validator) {
        this.service = service
        this.validator = validator

        this.postAlbumHandler = this.postAlbumHandler.bind(this)
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
    }

    async postAlbumHandler(request, h) {
        try {
            this.validator.validateAlbumsPayload(request.payload);
            
            const { name, year } = request.payload
            const albumId = await this.service.addAlbum({ name, year })

            const response = h.response({
                status: 'success',
                data: {
                    albumId,
                },
            });

            response.code(201);
            return response
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.code);
                return response;
            }
            return serverErrorResponse(error, h);
        }
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;

            const album = await this.service.getAlbumById(id);

            return {
                status: 'success',
                data: {
                    album,
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.code);
                return response;
            }
            return serverErrorResponse(error, h);
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;

            this.validator.validateAlbumsPayload(request.payload);
            
            await this.service.editAlbumById(id, request.payload);

            return {
                status: 'success',
                message: 'Album berhasil diperbarui',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.code);
                return response;
            }
            return serverErrorResponse(error, h);
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;

            await this.service.deleteAlbumById(id);

            return {
                status: 'success',
                message: 'Album berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.code);
                return response;
            }

            return serverErrorResponse(error, h);
        }
    }
}

module.exports = AlbumsHandler