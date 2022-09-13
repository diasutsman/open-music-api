const { Pool } = require("pg");

class SongsService {
    constructor() {
        this.pool = new Pool()
    }

    async addSong({title, year, genre, performer, duration = null, albumId = null}) {

    }

    async getSongs() {

    }

    async getSongById(id) {

    }
    
    async editSongById(id, {title, year, genre, performer, duration = null, albumId = null}) {
        
    }

    async deleteSongById(id) {
        
    }
}