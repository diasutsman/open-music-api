const { nanoid } = require('nanoid');
const { Pool } = require("pg");
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
    constructor() {
        this.pool = new Pool()
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year]
        }

        const result = await this.pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id
    }

    async getAlbumById(id) {

        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        }

        const result = await this.pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const album = result.rows[0]

        album.songs = await (async () => {
            const query = {
                text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
                values: [id],
            }
            const result = await this.pool.query(query)
            console.log(result.rows)
            return result.rows
        })()

        return album
    }

    async editAlbumById(id, { name, year }) {

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        }

        const result = await this.pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsService