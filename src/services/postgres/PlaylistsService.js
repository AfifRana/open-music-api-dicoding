const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const queryPlaylists = {
      text: `SELECT playlists.* FROM playlists LEFT JOIN collaborations
      ON playlists.id = collaborations.playlist_id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id`,
      values: [owner],
    };

    const resultPlaylists = await this._pool.query(queryPlaylists);

    const playlists = [];

    await Promise.all(resultPlaylists.rows.map(async (row) => {
      const queryUsername = {
        text: 'SELECT username FROM users WHERE id = $1',
        values: [row.owner],
      };

      const resultUsername = await this._pool.query(queryUsername);

      const { username } = resultUsername.rows[0];
      const { id, name } = row;

      playlists.push({ id, name, username });
    }));

    return playlists;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playsong-${nanoid(16)}`;

    await this.isPlaylistExist(playlistId);
    await this.isSongExist(songId);

    const queryInsert = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const resultInsert = await this._pool.query(queryInsert);

    if (!resultInsert.rows.length) {
      throw new NotFoundError('Lagu gagal ditambahkan ke dalam playlist');
    }

    return resultInsert.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const songs = [];

    const playlist = await this.isPlaylistExist(playlistId);

    const queryUsername = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [playlist.rows[0].owner],
    };

    const resultUsername = await this._pool.query(queryUsername);

    const queryPlaylistSongs = {
      text: 'SELECT song_id FROM playlist_songs WHERE playlist_id = $1',
      values: [playlistId],
    };

    const playlistSongs = await this._pool.query(queryPlaylistSongs);

    await Promise.all(playlistSongs.rows.map(async (row) => {
      const querySongs = {
        text: 'SELECT id, title, performer FROM songs WHERE id = $1',
        values: [row.song_id],
      };

      const result = await this._pool.query(querySongs);
      songs.push(result.rows[0]);
    }));

    const { id, name } = playlist.rows[0];
    const { username } = resultUsername.rows[0];
    const composedPlaylist = {
      id, name, username, songs,
    };

    return composedPlaylist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan pada playlist');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const result = await this.isPlaylistExist(id);
    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addActivityToPlaylist(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    await this.isPlaylistExist(playlistId);
    await this.isSongExist(songId);

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activities gagal ditambahkan');
    }
  }

  async getActivitiesFromPlaylist(playlistId) {
    const queryActivity = {
      text: 'SELECT song_id, user_id, action, time FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId],
    };

    const resultActivity = await this._pool.query(queryActivity);

    if (!resultActivity.rows.length) {
      return resultActivity.rows;
    }

    const activities = [];

    await Promise.all(resultActivity.rows.map(async (row) => {
      const queryUsername = {
        text: 'SELECT username FROM users WHERE id = $1',
        values: [row.user_id],
      };

      const resultUsername = await this._pool.query(queryUsername);

      const queryTitle = {
        text: 'SELECT title FROM songs WHERE id = $1',
        values: [row.song_id],
      };

      const resultTitle = await this._pool.query(queryTitle);

      const { username } = resultUsername.rows[0];
      const { title } = resultTitle.rows[0];
      const { action, time } = row;

      activities.push({
        username, title, action, time,
      });
    }));

    return activities;
  }

  async isPlaylistExist(playlistId) {
    const queryPlaylist = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return resultPlaylist;
  }

  async isSongExist(songId) {
    const querySong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return resultSong;
  }
}

module.exports = PlaylistsService;
