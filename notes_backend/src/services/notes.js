const db = require('./database');

// PUBLIC_INTERFACE
async function createNote(userId, { title, content }) {
  /**
   * Creates a note for the specific user, returns new note object.
   */
  await db.runQuery(
    'INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    [userId, title, content || '']
  );
  const note = await db.fetchOne(
    'SELECT * FROM notes WHERE user_id = ? AND title = ? ORDER BY created_at DESC LIMIT 1',
    [userId, title]
  );
  return note;
}

// PUBLIC_INTERFACE
async function getAllNotes(userId) {
  /**
   * Returns all notes for user, ordered by updated_at DESC.
   */
  return db.fetchAll('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
}

// PUBLIC_INTERFACE
async function getNoteById(userId, noteId) {
  /**
   * Returns a single note (if owned by user), or null.
   */
  return db.fetchOne('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
}

// PUBLIC_INTERFACE
async function updateNote(userId, noteId, { title, content }) {
  /**
   * Updates a note (if owned by user); returns updated row or null if not found.
   */
  const note = await getNoteById(userId, noteId);
  if (!note) return null;
  await db.runQuery(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title ?? note.title, content ?? note.content, noteId, userId]
  );
  return getNoteById(userId, noteId);
}

// PUBLIC_INTERFACE
async function deleteNote(userId, noteId) {
  /**
   * Deletes a note by ID (if owned by user).
   * Returns true if deleted, false if not found.
   */
  const note = await getNoteById(userId, noteId);
  if (!note) return false;
  await db.runQuery('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  return true;
}

// PUBLIC_INTERFACE
async function searchNotes(userId, query) {
  /**
   * Finds notes by title/content substring for a user.
   */
  const q = `%${query}%`;
  return db.fetchAll(
    'SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) ORDER BY updated_at DESC',
    [userId, q, q]
  );
}

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
};
