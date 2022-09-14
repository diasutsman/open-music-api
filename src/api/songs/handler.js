const SongsService = require('../../services/postgres/SongsService')
const SongsValidator = require('../../validator/songs/index')
const ClientError = require('../../exceptions/ClientError')
const { serverErrorResponse } = require('../../utils')


class SongsHandler {

    /**
     * 
     * @param {SongsService} service 
     * @param {SongsValidator} validator 
     */
    constructor(service, validator) {
        this.service = service
        this.validator = validator

        this.postSongHandler = this.postSongHandler.bind(this);
        this.getSongsHandler = this.getSongsHandler.bind(this);
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
        this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    }

    async postSongHandler(request, h) {
        try {
            this.validator.validateSongsPayload(request.payload);

            const { title, year, performer, genre, duration, albumId } = request.payload
            const songId = await this.service.addSong({ title, year, performer, genre, duration, albumId })

            const response = h.response({
                status: 'success',
                data: {
                    songId,
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

    async getSongsHandler() {
        const songs = await this.service.getSongs()
        return {
            status: 'success',
            data: {
                songs,
            },
        }
    }

    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params
            const song = await this.service.getSongById(id)

            return {
                status: 'success',
                data: {
                    song,
                },
            }
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

    async putSongByIdHandler(request, h) {
        try {
            this.validator.validateSongsPayload(request.payload);

            const { id } = request.params
            await this.service.editSongById(id, request.payload)

            return {
                status: 'success',
                message: 'Lagu berhasil diperbarui',
            }
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

    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params
            await this.service.deleteSongById(id)

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus',
            }
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

module.exports = SongsHandler