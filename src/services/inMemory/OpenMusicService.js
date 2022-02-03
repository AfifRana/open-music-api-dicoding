const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapGetSongs } = require('../../utils');

class OpenMusicService {
  constructor() {
    this._albums = [];
    this._songs = [];
  }

  addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const newAlbum = {
      id, name, year,
    };

    this._albums.push(newAlbum);

    const isSuccess = this._albums.filter((album) => album.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return id;
  }

  addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const newSong = {
      id, title, year, genre, performer, duration, albumId,
    };

    this._songs.push(newSong);

    const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return id;
  }

  getAlbums() {
    return this._albums;
  }

  getSongs() {
    return this._songs.map(mapGetSongs);
  }

  getAlbumById(id) {
    const album = this._albums.filter((album) => album.id === id)[0];

    if (!album) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const { name, year } = album;
    const songs = this._songs.filter((song) => song.albumId === id).map(mapGetSongs);
    const composedAlbum = {
      id, name, year, songs,
    };

    return composedAlbum;
  }

  getSongById(id) {
    const song = this._songs.filter((song) => song.id === id)[0];

    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return song;
  }

  getSongsByTitle(title) {
    const song = this._songs.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));

    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return song.map(mapGetSongs);
  }

  getSongsByPerformer(performer) {
    const song = this._songs.filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()));

    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return song.map(mapGetSongs);
  }

  editAlbumById(id, { name, year }) {
    const index = this._albums.findIndex((album) => album.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbaharui album. Id tidak ditemukan!');
    }

    this._albums[index] = {
      ...this._albums[index],
      name,
      year,
    };
  }

  editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const index = this._songs.findIndex((song) => song.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbaharui lagu. Id tidak ditemukan!');
    }

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

  deleteAlbumById(id) {
    const index = this._albums.findIndex((album) => album.id === id);

    if (index === -1) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    this._albums.splice(index, 1);
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((song) => song.id === id);

    if (index === -1) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    this._songs.splice(index, 1);
  }
}

module.exports = OpenMusicService;
