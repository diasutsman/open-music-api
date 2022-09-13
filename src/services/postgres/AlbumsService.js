const { Pool } = require("pg");

class AlbumsService {
    constructor() {
        this.pool = new Pool()
    }

    async addAlbum({name, year}) {

    }

    async getAlbum(id) {
        
    }

    async editAlbumById(id, {name, year}) {

    }
    
    async deleteAlbumById(id) {

    }
}