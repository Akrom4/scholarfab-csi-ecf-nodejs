export function fetchNotesByUser(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM notes WHERE owner_id=?')
        stmt.all([ userId ], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p)
        })
    })
}

export function createNote(db, { title, content, ownerId }) {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString()
        const stmt = db.prepare('INSERT INTO notes(title, content, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)')
        stmt.run([ title, content, ownerId, createdAt, createdAt ], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p)
        })
    })
}

export function fetchNoteById(db, id) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM notes WHERE id=?');
        stmt.get([id], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

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


export function fetchSharedNotesByUser(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            SELECT notes.*
            FROM notes
            JOIN shares ON notes.id = shares.note_id
            WHERE shares.user_id = ?
        `);
        stmt.all([userId], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

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
