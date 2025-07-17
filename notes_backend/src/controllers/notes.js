const notesService = require('../services/notes');

/**
 * Controller for notes APIs (CRUD and search).
 */
class NotesController {
  // PUBLIC_INTERFACE
  async create(req, res) {
    /**
     * Creates a new note for the authenticated user.
     * body: {title, content}
     */
    const userId = req.user.id;
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    try {
      const note = await notesService.createNote(userId, { title, content });
      res.status(201).json(note);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Could not create note' });
    }
  }

  // PUBLIC_INTERFACE
  async getAll(req, res) {
    /**
     * Gets all notes for current user. Query param: optional search.
     */
    const userId = req.user.id;
    const { q } = req.query;
    try {
      const notes = q
        ? await notesService.searchNotes(userId, q)
        : await notesService.getAllNotes(userId);
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Could not fetch notes' });
    }
  }

  // PUBLIC_INTERFACE
  async getById(req, res) {
    /**
     * Gets a single note by ID (if owned by user).
     */
    const userId = req.user.id;
    const noteId = req.params.id;
    try {
      const note = await notesService.getNoteById(userId, noteId);
      if (!note) {
        res.status(404).json({ message: 'Note not found' });
      } else {
        res.json(note);
      }
    } catch (err) {
      res.status(500).json({ message: err.message || 'Could not fetch note' });
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res) {
    /**
     * Updates a note (if owned by user).
     */
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content } = req.body;
    try {
      const updated = await notesService.updateNote(userId, noteId, { title, content });
      if (!updated) {
        res.status(404).json({ message: 'Note not found' });
      } else {
        res.json(updated);
      }
    } catch (err) {
      res.status(500).json({ message: err.message || 'Could not update note' });
    }
  }

  // PUBLIC_INTERFACE
  async delete(req, res) {
    /**
     * Deletes a note (if owned by user).
     */
    const userId = req.user.id;
    const noteId = req.params.id;
    try {
      const deleted = await notesService.deleteNote(userId, noteId);
      if (!deleted) {
        res.status(404).json({ message: 'Note not found' });
      } else {
        res.status(204).send();
      }
    } catch (err) {
      res.status(500).json({ message: err.message || 'Could not delete note' });
    }
  }
}

module.exports = new NotesController();
