class PlaylistsHandler {
    constructor(service, validator) {
        this.service = service;
        this.validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        this.validator.validatePostPlaylistPayload(request.payload);
        const { name } = request.payload;

        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this.service.addPlaylist(name, credentialId);

        const response = h.response({
            status: 'success',
            data: {
                playlistId
            }
        })
        response.code(201)

        return response
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this.service.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists
            }
        }
    }

    async deletePlaylistByIdHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this.service.verifyPlaylistOwner(id, credentialId);
        await this.service.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus'
        }
    }

    async postSongToPlaylistHandler(request, h) {
        this.validator.validatePostPlaylistSongPayload(request.payload);
        const { id } = request.params;
        const { songId } = request.payload;

        const { id: credentialId } = request.auth.credentials;
        await this.service.verifyPlaylistOwner(id, credentialId);
        await this.service.addSongToPlaylistById(id, songId);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist'
        })
        response.code(201)

        return response
    }

    async getSongsFromPlaylistHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this.service.verifyPlaylistOwner(id, credentialId);
        const playlist = await this.service.getPlaylistSongsById(id);

        return {
            status: 'success',
            data: {
                playlist
            }
        }
    }

    async deleteSongFromPlaylistHandler(request) {
        const { id } = request.params;
        const { songId } = request.payload;

        const { id: credentialId } = request.auth.credentials;
        await this.service.verifyPlaylistOwner(id, credentialId);
        await this.service.deletePlaylistSongsById(id, songId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist'
        }
    }
}

module.exports = PlaylistsHandler