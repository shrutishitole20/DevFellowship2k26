const express = require('express');
const { PUBLIC_PATH } = require('../config/constants');
const { createNotesRepository } = require('../notes/notesRepository');
const { createNotesController } = require('../notes/notesController');
const { createNotesRouter } = require('../notes/notesRoutes');
const { apiErrorHandler, notFoundHandler } = require('../middleware/errorHandlers');

function createApp(db) {
  const app = express();
  const notesRepo = createNotesRepository(db);
  const notesController = createNotesController(notesRepo);

  app.use(express.json());
  app.use(express.static(PUBLIC_PATH));
  app.use('/notes', createNotesRouter(notesController));
  app.use(apiErrorHandler);
  app.use(notFoundHandler);

  return app;
}

module.exports = {
  createApp
};
