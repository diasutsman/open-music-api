const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
    constructor(playlistsSongsService, collaborationsService) {
        this.pool = new Pool();
        this.playlistsSongsService = playlistsSongsService;
        this.collaborationsService = collaborationsService;
    }

    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        }

        const result = await this.pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return result.rows[0].id
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN users ON playlists.owner = users.id
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        }

        const result = await this.pool.query(query);
        return result.rows
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1',
            values: [id],
        }

        const result = await this.pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        // Query to database
        const result = await this.pool.query(query);

        // If playlist not exists then throws NotFoundError
        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const note = result.rows[0];

        // If the playlist does not own this notes then throwsAuthorizationError
        if (note.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this.collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addSongToPlaylistById(id, songId) {
        await this.playlistsSongsService.addPlaylistSong(id, songId)
    }

    async getPlaylistSongsById(id) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN users ON playlists.owner = users.id
            WHERE playlists.id = $1`,
            values: [id]
        }

        const result = await this.pool.query(query);


        result.rows[0].songs = (await this.pool.query({
            text: `SELECT songs.id, songs.title, songs.performer FROM songs
            LEFT JOIN playlists_songs ON playlists_songs.song_id = songs.id
            WHERE playlists_songs.playlist_id = $1
            GROUP BY songs.id`,
            values: [id]
        })).rows

        return result.rows[0]
    }

    async deletePlaylistSongsById(id, songId) {
        await this.playlistsSongsService.deletePlaylistSong(id, songId)
    }
}

module.exports = PlaylistsService