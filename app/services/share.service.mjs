export function createShare(db, { noteId, userId, permission }) {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        const stmt = db.prepare('INSERT INTO shares (note_id, user_id, perm, created_at) VALUES (?,?,?,?)');
        stmt.run([noteId, userId, permission, createdAt], (err) => {
            if (err) {
                console.error('Error inserting share:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function fetchSharesByUser(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM shares WHERE user_id=?');
        stmt.all([userId], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

export function revokeShare(db, shareId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('DELETE FROM shares WHERE id=?');
        stmt.run([shareId], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p);
        });
    });
}

export function fetchSharesByNote(db, userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            SELECT shares.*, notes.title, notes.content
            FROM shares
            JOIN notes ON shares.note_id = notes.id
            WHERE notes.owner_id = ?
        `);
        stmt.all([userId], (err, data) => {
            if (err) {
                console.error('Error fetching shares by note:', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export function fetchShareByNoteAndUser(db, { noteId, userId }) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM shares WHERE note_id = ? AND user_id = ?');
        stmt.get([noteId, userId], (err, data) => {
            if (err) {
                console.error('Error fetching share by note and user:', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

