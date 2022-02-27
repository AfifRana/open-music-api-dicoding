/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(60)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(60)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(60)',
      notNull: true,
    },
  });

  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id_to_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id_to_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.album_id_to_albums.id');
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.user_id_to_users.id');
  pgm.dropTable('user_album_likes');
};
