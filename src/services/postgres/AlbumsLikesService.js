const { nanoid } = require("nanoid");
const { Pool } = require("pg");

class AlbumsLikesService {
    constructor(cacheService) {
        this._pool = new Pool()
        this._cacheService = cacheService;
    }

    async toggleLikes(userId, albumId) {
        const isLiked = await this._checkIfLiked(userId, albumId);

        await (isLiked ? this._dislike(userId, albumId) : this._like(userId, albumId));

        await this._cacheService.delete(`likes:${albumId}`)
    }

    async getAlbumLikes(id) {
        try {
            const likes = await this._cacheService.get(`likes:${id}`)

            return {likes: JSON.parse(likes), cache: 'cache'}
        } catch (error) {
            const query = {
                text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
                values: [id],
            }

            const {rowCount: likes} = await this._pool.query(query)

            await this._cacheService.set(`likes:${id}`, JSON.stringify(likes))

            return {likes}
        }
    }

    async _like(userId, albumId) {
        const id = `like-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
            values: [id, userId, albumId]
        }
        await this._pool.query(query)
    }

    async _dislike(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId]
        }
        await this._pool.query(query)
    }

    async _checkIfLiked(userId, albumId) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        }

        const result = await this._pool.query(query)

        return result.rowCount > 0
    }
}

module.exports = AlbumsLikesService;
