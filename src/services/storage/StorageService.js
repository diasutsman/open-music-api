const fs = require('fs');

/**
 * StorageService class
 */
class StorageService {
  /**
   * StorageService class constructor
   * @param {string} folder
   */
  constructor(folder) {
    this._folder = folder;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {recursive: true});
    }
  }

  /**
   * Write file to the local storage
   * @param {string} file
   * @param {{filename: string}} meta
   * @return {Promise<string>}
   */
  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const filestream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      filestream.on('error', reject);
      file.pipe(filestream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
