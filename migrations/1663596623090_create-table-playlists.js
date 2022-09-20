/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNUll: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNUll: true,
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('playlists')
};
