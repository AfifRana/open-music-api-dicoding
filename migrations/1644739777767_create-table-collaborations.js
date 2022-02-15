/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(60)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(60)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(60)',
      notNull: true,
    },
  });

  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_to_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_to_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'fk_collaborations.user_id_to_users.id');
  pgm.dropConstraint('collaborations', 'fk_collaborations.playlist_id_to_playlists.id');
  pgm.dropTable('collaborations');
};
