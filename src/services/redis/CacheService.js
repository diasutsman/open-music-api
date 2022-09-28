const redis = require('redis');
const config = require('../../utils/config');

/**
 * CacheService class
 */
class CacheService {
  /**
   * CacheService class constructor
   */
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', console.error);

    this._client.connect();
  }

  /**
   * Set key in Redis client
   * @param {String} key
   * @param {String} value
   * @param {Number} expirationInSecond
   */
  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  /**
   * Get key from Redis client
   * @param {string} key
   * @return {string}
   */
  async get(key) {
    const result = await this._client.get(key);

    // if null then throw error
    if (result === null) throw new Error('Cache tidak ditemukan');

    return result;
  }

  /**
   * Delete key from Redis client
   * @param {string} key
   * @return {Promise<number>}
   */
  delete(...key) {
    return this._client.del(...key);
  }
}

module.exports = CacheService;
