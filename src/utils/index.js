const mapDBToModel = ({id, title, body, tags, created_at, updated_at}) => ({
    id, title, body, tags, createdAt: created_at, updatedAt: updated_at,
});

const mapGetSongs = ({id, title, year, genre, performer, duration, albumId}) => ({
    id, title, performer, 
});

// const mapGetSong = ({id, title, year, genre, performer, duration, albumId}) => ({
//     id, title, year, performer, genre, duration, albumId,
// })

module.exports = {mapDBToModel, mapGetSongs};