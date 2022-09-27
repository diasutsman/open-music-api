const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const {mapAlbumsDBtoModel} = require('../../utils');

/**
 * ALbumsService to provide data from songs table
 */
class AlbumsService {
  /**
   * Constructor to create new instance of ALbumsService that initialize pool
   */
  constructor() {
    this.pool = new Pool();
  }

  /**
   * Add new album to database and return its id
   * @param {{name: string, year: number}} postReqBody
   * @return {Promise<string>}
   */
  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }
  /**
   * Get album by id
   * @param {string} id
   * @return {Promise<any>}
   */
  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const [album] = result.rows.map(mapAlbumsDBtoModel);

    album.songs = (await this.pool.query({
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    })).rows;

    return album;
  }
  /**
   * Edit album by id
   * @param {string} id
   * @param {{name: string, year: number}} putReqBody
   */
  async editAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }
  /**
   * Delete album by id
   * @param {string} id
   */
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

  /**
   * Add cover to an album by id
   * @param {String} id
   * @param {String} cover
   */
  async addAlbumCoverById(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [cover, id],
    };

    await this.pool.query(query);
  }
}

module.exports = AlbumsService;
