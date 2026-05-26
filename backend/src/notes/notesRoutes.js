const express = require('express');

function createNotesRouter(controller) {
  const router = express.Router();
  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}

module.exports = {
  createNotesRouter
};
