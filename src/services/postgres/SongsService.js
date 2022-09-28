const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

/**
 * SongsService to provide data from songs table
 */
class SongsService {
  /**
   * Constructor to create new instance of SongsService that initialize pool
   */
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService
  }

  /**
   * Add new song to database and return its id
   * @param {{
   *   title: string,
   *   year: string,
   *   genre: string,
   *   performer: string,
   *   duration : string?,
   *   albumId : string?,
   * }} postReqBody
   * @return {Promise<string>}
   */
  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Get all songs from database and filtered it by query
   * @param {{title: string, performer: string}} queryObj
   * @return {Promise<any[]>}
   */
  async getSongs({title = '', performer = ''}) {
    const query = {
      text: `SELECT id, title, performer FROM songs 
            WHERE title iLIKE $1 AND performer iLIKE $2`,
      values: [`%${title}%`, `%${performer}%`],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  /**
   * Get song by id
   * @param {string} id
   * @return {Promise<any>}
   */
  async getSongById(id) {
    try {
      const song = JSON.parse(await this._cacheService.get(`song:${id}`))
      return {song, cache: 'cache'}
    } catch (error) {
      const query = {
        text: `SELECT id, title, year, performer, genre, duration 
        FROM songs WHERE id = $1`,
        values: [id],
      };
  
      const result = await this._pool.query(query);
  
      if (!result.rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }
      
      const [song] = result.rows

      return {song};
    }
  }

  /**
   * Edit song by id
   * @param {string} id
   * @param {{
   *   title: string,
   *   year: string,
   *   genre: string,
   *   performer: string,
   *   duration : string?,
   *   albumId : string?,
   * }} putReqBody
   */
  async editSongById(id, {title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const query = {
      text: `UPDATE songs 
        SET title = $1, 
        year = $2, 
        genre = $3, 
        performer = $4, 
        duration = $5, album_id = $6 WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    await this._deleteSongCache(id)
  }

  /**
   * Delete song by id
   * @param {string} id
   */
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }

    await this._deleteSongCache(id)
  }

  _deleteSongCache(id) {
    return this._cacheService.delete(`song:${id}`)
  }
}

module.exports = SongsService;
