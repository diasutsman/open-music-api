class PlaylistsHandler {
    constructor(playlistService, playlistActivitiesService, validator) {
        this.playlistService = playlistService;
        this.playlistActivitiesService = playlistActivitiesService
        this.validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
        this.getActivitiesFromPlaylistHandler = this.getActivitiesFromPlaylistHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        this.validator.validatePostPlaylistPayload(request.payload);
        const { name } = request.payload;

        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this.playlistService.addPlaylist(name, credentialId);

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
        const playlists = await this.playlistService.getPlaylists(credentialId);

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

        await this.playlistService.verifyPlaylistOwner(id, credentialId);
        await this.playlistService.deletePlaylistById(id);

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
        await this.playlistService.verifyPlaylistAccess(id, credentialId);
        await this.playlistService.addSongToPlaylistById(id, songId);

        this.playlistActivitiesService.addPlaylistActivity(id, songId, credentialId, 'add');

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

        await this.playlistService.verifyPlaylistAccess(id, credentialId);
        const playlist = await this.playlistService.getPlaylistSongsById(id);

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
        await this.playlistService.verifyPlaylistAccess(id, credentialId);
        await this.playlistService.deletePlaylistSongsById(id, songId);

        this.playlistActivitiesService.addPlaylistActivity(id, songId, credentialId, 'delete');

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist'
        }
    }

    async getActivitiesFromPlaylistHandler(request) {
        const { id: playlistId} = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);
        const activities = await this.playlistActivitiesService.getPlaylistActivities(playlistId);

        return {
            status: 'success',
            data: {
                playlistId,
                activities,
            }
        }
    }
}

module.exports = PlaylistsHandler