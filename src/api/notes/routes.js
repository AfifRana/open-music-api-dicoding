const routes = (handler) => [
    {
        method: 'POST',
        path: '/notes',
        handler: handler.postNoteHandler,
    },
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'POST',
        path: '/songs',
        handler: handler.postSongHandler,
    },
    {
        method: 'GET',
        path: '/notes',
        handler: handler.getNotesHandler,
    },
    {
        method: 'GET',
        path: '/albums',
        handler: handler.getAlbumsHandler,
    },
    {
        method: 'GET',
        path: '/songs',
        handler: handler.getSongsHandler,
    },
    {
        method: 'GET',
        path: '/notes/{id}',
        handler: handler.getNoteByIdHandler,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumByIdHandler,
    },
    {
        method: 'GET',
        path: '/songs/{id}',
        handler: handler.getSongByIdHandler,
    },
    {
        method: 'PUT',
        path: '/notes/{id}',
        handler: handler.putNoteByIdHandler,
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,
    },
    {
        method: 'PUT',
        path: '/songs/{id}',
        handler: handler.putSongByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/notes/{id}',
        handler: handler.deleteNoteByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/songs/{id}',
        handler: handler.deleteSongByIdHandler,
    },
];

module.exports = routes;