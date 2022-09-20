/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('playlists_songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    })

    // menambahkan constraint unique pada kolom note_id dan user_id agar tidak terjadi duplikasi data pada nilai keduanya

    pgm.addConstraint('playlists_songs', 'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)')

    // Memberikan constraint foreign key pada kolom note_id dan user id terhadap users.id dan notes.id

    pgm.addConstraint('playlists_songs', 'fk_playlists_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
    pgm.addConstraint('playlists_songs', 'fk_playlists_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = pgm => {
    pgm.dropTable('playlists_songs')
};
