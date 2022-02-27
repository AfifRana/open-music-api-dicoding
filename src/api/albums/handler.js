const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(albumsService, storageService, albumsValidator, uploadsValidator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumsValidator = albumsValidator;
    this._uploadsValidator = uploadsValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeToAlbumHandler = this.postLikeToAlbumHandler.bind(this);
    this.getLikesFromAlbumHandler = this.getLikesFromAlbumHandler.bind(this);
    this.postCoverAlbumHandler = this.postCoverAlbumHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._albumsValidator.validateAlbumPayload(request.payload);
      const { name, year, cover = null } = request.payload;

      const albumId = await this._albumsService.addAlbum({ name, year, cover });

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._albumsService.getAlbumById(id);

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._albumsValidator.validateAlbumPayload(request.payload);
      const { id } = request.params;

      await this._albumsService.editAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Album berhasil diperbaharui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._albumsService.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postLikeToAlbumHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      let response;

      if (await this._albumsService.isLiked(credentialId, albumId)) {
        await this._albumsService.deleteLike(credentialId, albumId);
        response = h.response({
          status: 'success',
          message: 'Berhasil batal menyukai album',
          data: {
            albumId,
          },
        });
      } else {
        await this._albumsService.addLike(credentialId, albumId);

        response = h.response({
          status: 'success',
          message: 'Berhasil menyukai album',
          data: {
            albumId,
          },
        });
      }
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getLikesFromAlbumHandler(request, h) {
    try {
      const { id: albumId } = request.params;

      const resp = await this._albumsService.getLikesCount(albumId);
      const { count: likes, source } = resp;

      const response = h.response({
        status: 'success',
        message: 'Berikut data suka album',
        data: {
          likes,
        },
      });

      if (source === 'cache') {
        response.header('X-Data-Source', 'cache');
      }

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postCoverAlbumHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { cover } = request.payload;
      this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      // Simpan alamat cover ke db. Timpah jika sudah ada
      await this._albumsService.editCoverAlbum(albumId, fileLocation);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
        data: {
          fileLocation,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
