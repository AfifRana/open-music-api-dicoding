const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year, cover = null }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, cover],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');

    return result.rows;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const album = await this._pool.query(queryAlbum);

    if (!album.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongs = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songs = (await this._pool.query(querySongs)).rows;

    const { name, year, cover: coverUrl } = album.rows[0];
    const composedAlbum = {
      id, name, year, coverUrl, songs,
    };

    return composedAlbum;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbaharui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editCoverAlbum(albumId, cover) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const album = await this._pool.query(queryAlbum);

    if (!album.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const queryCover = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, albumId],
    };

    const result = await this._pool.query(queryCover);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbaharui sampul');
    }

    return result.rows[0].id;
  }

  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const queryUser = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };

    const resultUser = await this._pool.query(queryUser);

    if (!resultUser.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const queryInsert = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const resultInsert = await this._pool.query(queryInsert);

    if (!resultInsert.rows.length) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return resultInsert.rows[0].id;
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal batalkan menyukai album');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async isLiked(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return false;
    }

    return true;
  }

  async getLikesCount(albumId) {
    let resp;

    try {
      const result = await this._cacheService.get(`likes:${albumId}`);

      resp = {
        count: JSON.parse(result),
        source: 'cache',
      };

      return resp;
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Gagal mendapatkan jumlah suka');
      }

      await this._cacheService.set(`likes:${albumId}`, JSON.parse(result.rows[0].count));
      resp = {
        count: JSON.parse(result.rows[0].count),
        source: 'database',
      };

      return resp;
    }
  }
}

module.exports = AlbumsService;
