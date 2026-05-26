const { isFilledString, normalizeOnCreate, normalizeOnUpdate } = require('./notesValidation');

function createNotesController(notesRepo) {
  return {
    getAll: async (req, res, next) => {
      try { res.json(await notesRepo.getAll()); } catch (error) { next(error); }
    },

    create: async (req, res, next) => {
      try {
        if (!isFilledString(req.body.title)) return res.status(400).json({ error: 'Title is required and must not be empty.' });
        if (!isFilledString(req.body.content)) return res.status(400).json({ error: 'Content is required and must not be empty.' });
        const payload = normalizeOnCreate(req.body);
        const result = await notesRepo.create(payload);
        res.status(201).json(await notesRepo.getById(result.id));
      } catch (error) { next(error); }
    },

    update: async (req, res, next) => {
      try {
        const { id } = req.params;
        const existing = await notesRepo.getById(id);
        if (!existing) return res.status(404).json({ error: `Note with ID ${id} not found.` });
        if (req.body.title !== undefined && !isFilledString(req.body.title)) return res.status(400).json({ error: 'Title cannot be empty.' });
        if (req.body.content !== undefined && !isFilledString(req.body.content)) return res.status(400).json({ error: 'Content cannot be empty.' });
        await notesRepo.update(id, normalizeOnUpdate(req.body, existing));
        res.json(await notesRepo.getById(id));
      } catch (error) { next(error); }
    },

    remove: async (req, res, next) => {
      try {
        const { id } = req.params;
        const existing = await notesRepo.getById(id);
        if (!existing) return res.status(404).json({ error: `Note with ID ${id} not found.` });
        await notesRepo.remove(id);
        res.json({ message: 'Note successfully deleted.', id: parseInt(id, 10) });
      } catch (error) { next(error); }
    }
  };
}

module.exports = {
  createNotesController
};
