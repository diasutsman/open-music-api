const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const AuthorizationError = require("../../exceptions/AuthorizationError");


class CollaborationsService {
    constructor(usersService) {
        this.pool = new Pool();
        this.usersService = usersService;
    }

    async addCollaboration(playlistId, userId) {
        const id = `collab-${nanoid(16)}`;

        await this.usersService.verifyUserExist(userId)

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };

        const result = await this.pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async deleteCollaboration(playlistId, userId) {
        
        await this.usersService.verifyUserExist(userId)

        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        };

        const result = await this.pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    async verifyCollaborator(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        };

        const result = await this.pool.query(query);

        if (!result.rowCount) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

}

module.exports = CollaborationsService;
