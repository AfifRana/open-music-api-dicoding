const { nanoid } = require("nanoid");
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapGetSongs} = require("../../utils");

class OpenMusicService {
    constructor() {
        this._notes = [];
        this._albums = [];
        this._songs = [];
    }

    addNote({title, body, tags}) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const newNote = {
            title, tags, body, id, createdAt, updatedAt,
        };

        this._notes.push(newNote);

        const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

        if(!isSuccess) {
            throw new InvariantError('Catatan gagal ditambahkan');
        }

        return id;
    }

    addAlbum({name, year}) {
        const id = 'album-'+nanoid(16);

        const newAlbum = {
            id, name, year,
        };

        this._albums.push(newAlbum);

        const isSuccess = this._albums.filter((album) => album.id === id).length > 0;

        if(!isSuccess) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return id;
    }

    addSong({title, year, genre, performer, duration, albumId}) {
        const id = 'song-'+nanoid(16);

        const newSong = {
            id, title, year, genre, performer, duration, albumId,
        };

        this._songs.push(newSong);

        const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

        if(!isSuccess) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return id;
    }

    getNotes() {
        return this._notes;
    }

    getAlbums() {
        // console.log(this._albums);
        return this._albums;
    }

    getSongs() {
        // console.log(this._songs);
        return this._songs.map(mapGetSongs);
    }

    getNoteById(id) {
        const note = this._notes.filter((note) => note.id === id)[0];

        if(!note) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        return note;
    }

    getAlbumById(id) {
        const album = this._albums.filter((album) => album.id === id)[0];

        if(!album) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const {name, year} = album;
        const songs = this._songs.filter((song) => song.albumId === id).map(mapGetSongs);
        const composedAlbum = {
            id, name, year, songs,
        };
        // console.log(album);
        // console.log(composedAlbum);

        return composedAlbum;
    }

    getSongById(id) {
        const song = this._songs.filter((song) => song.id === id)[0];
        // const song = this._songs.filter((song) => song.title.includes('Life'))[0];
        // console.log(song);

        if(!song) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return song;
    }

    getSongByTitle(title) {
        const song = this._songs.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));
        // const song = this._songs.filter((song) => song.title.includes('int'));
        // console.log(song);

        if(!song) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return song.map(mapGetSongs);
    }

    getSongByPerformer(performer) {
        const song = this._songs.filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()));
        // const song = this._songs.filter((song) => song.title.includes('Life'))[0];
        // console.log(song);

        if(!song) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return song.map(mapGetSongs);
    }

    editNoteById(id, {title, body, tags}) {
        const index = this._notes.findIndex((note) => note.id === id);

        if(index === -1) {
            throw new NotFoundError(`Gagal memperbaharui catatan. Id tidak ditemukan!`);
        }

        const updatedAt = new Date().toISOString();

        this._notes[index] = {
            ...this._notes[index],
            title,
            tags,
            body,
            updatedAt,
        };
    }

    editAlbumById(id, {name, year}) {
        const index = this._albums.findIndex((album) => album.id === id);

        if(index === -1) {
            throw new NotFoundError(`Gagal memperbaharui album. Id tidak ditemukan!`);
        }

        // const updatedAt = new Date().toISOString();

        this._albums[index] = {
            ...this._albums[index],
            name,
            year,
        };
    }

    editSongById(id, {title, year, genre, performer, duration, albumId}) {
        const index = this._songs.findIndex((song) => song.id === id);

        if(index === -1) {
            throw new NotFoundError(`Gagal memperbaharui lagu. Id tidak ditemukan!`);
        }

        // const updatedAt = new Date().toISOString();

        this._songs[index] = {
            ...this._songs[index],
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        };
    }

    deleteNoteById(id) {
        const index = this._notes.findIndex((note) => note.id === id);

        if(index === -1) {
            throw new NotFoundError(`Catatan gagal dihapus. Id tidak ditemukan`);
        }

        this._notes.splice(index, 1);
    }

    deleteAlbumById(id) {
        const index = this._albums.findIndex((album) => album.id === id);

        if(index === -1) {
            throw new NotFoundError(`Album gagal dihapus. Id tidak ditemukan`);
        }

        this._albums.splice(index, 1);
    }

    deleteSongById(id) {
        const index = this._songs.findIndex((song) => song.id === id);

        if(index === -1) {
            throw new NotFoundError(`Lagu gagal dihapus. Id tidak ditemukan`);
        }

        this._songs.splice(index, 1);
    }
}

module.exports = OpenMusicService;