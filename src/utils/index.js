const mapDBToModel = ({
  id, title, body, tags, created_at, updated_at,
}) => ({
  id, title, body, tags, createdAt: created_at, updatedAt: updated_at,
});

const mapGetSongs = ({
  id, title, year, genre, performer, duration, albumId,
}) => ({
  id, title, performer,
});

const mapGetSongsDB = ({
  id, title, year, genre, performer, duration, album_id,
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
