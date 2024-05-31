// Retrieves all notes belonging to a specific user
export function fetchNotesByUser(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM notes WHERE owner_id=?');
        stmt.all([userId], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

// Creates a new note with the provided details (title, content, owner)
export function createNote(db, { title, content, ownerId }) {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        const stmt = db.prepare('INSERT INTO notes(title, content, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)');
        stmt.run([title, content, ownerId, createdAt, createdAt], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

// Retrieves the details of a specific note by its identifier
export function fetchNoteById(db, id) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM notes WHERE id=?');
        stmt.get([id], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

// Updates the details of a specific note (title, content) and updates the modification date
export function updateNote(db, { id, title, content }) {
    return new Promise((resolve, reject) => {
        const updatedAt = new Date().toISOString();
        const stmt = db.prepare('UPDATE notes SET title=?, content=?, updated_at=? WHERE id=?');
        stmt.run([title, content, updatedAt, id], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

// Retrieves notes shared with a specific user, including sharing permissions
export function fetchSharedNotesByUser(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            SELECT notes.*, shares.perm
            FROM notes
            JOIN shares ON notes.id = shares.note_id
            WHERE shares.user_id = ?
        `);
        stmt.all([userId], (err, data) => {
            if (err) {
                console.error('Error fetching shared notes by user:', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Retrieves notes shared by a specific user with other users
export function fetchNotesSharedByUser(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            SELECT notes.*
            FROM notes
            JOIN shares ON notes.id = shares.note_id
            WHERE notes.owner_id = ?
        `);
        stmt.all([userId], (err, data) => {
            if (err) {
                console.error('Error fetching notes shared by user:', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Archives a specific note by setting the archived_at timestamp
export function archiveNote(db, id) {
    return new Promise((resolve, reject) => {
        const archivedAt = new Date().toISOString();
        const stmt = db.prepare('UPDATE notes SET archived_at=? WHERE id=?');
        stmt.run([archivedAt, id], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}
