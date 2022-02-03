require('dotenv').config();

const Hapi = require('@hapi/hapi');
const openMusic = require('./api/notes');
const OpenMusicService = require('./services/inMemory/OpenMusicService');
const OpenMusicValidator = require('./validator/notes');

const init = async () => {
  const openMusicService = new OpenMusicService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: openMusic,
    options: {
      service: openMusicService,
      validator: OpenMusicValidator, 
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
