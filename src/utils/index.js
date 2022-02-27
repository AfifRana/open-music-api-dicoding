/* eslint-disable camelcase */

const mapDBToModel = ({ created_at, updated_at, ...args }) => ({
  ...args,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapGetSongs = ({
  id, title, performer,
}) => ({
  id, title, performer,
});

const mapGetSongsDB = ({
  id, title, performer,
}) => ({
  id, title, performer,
});

const mapGetSongDB = ({
  id, title, year, genre, performer, duration, album_id,
}) => ({
  id, title, year, performer, genre, duration, albumId: album_id,
});

module.exports = {
  mapDBToModel, mapGetSongs, mapGetSongsDB, mapGetSongDB,
};
