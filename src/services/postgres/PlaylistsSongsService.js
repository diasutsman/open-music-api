const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistsSongsService {
    constructor(songsService) {
        this.pool = new Pool()
        this.songsService = songsService
    }

    async addPlaylistSong(playlistId, songId) {
        const id = `playlist_song-${nanoid(16)}`

        const song = await this.songsService.getSongById(songId)

        if (!song) {
            throw new NotFoundError('Lagu gagal ditambahkan ke playlist. Id lagu tidak ditemukan')
        }

        const query = {
            text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        };

        const result = await this.pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Gagal menambahkan lagu ke playlist')
        }
    }

    async deletePlaylistSong(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId],
        }

        const result = await this.pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Gagal menghapus lagu dari playlist')
        }
    }
}

module.exports = PlaylistsSongsService;