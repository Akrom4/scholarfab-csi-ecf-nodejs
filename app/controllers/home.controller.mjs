import { fetchNotesByUser, fetchSharedNotesByUser } from '../services/notes.service.mjs';

export function loadHomeController(app) {
    app.get('/', async (req, res) => {
        const { user } = req.session;
        
        if (!user) {
            return res.render('index', { user, notes: [], sharedNotes: [] });
        }
        
        try {
            const db = app.get('g:db');
            let notes = await fetchNotesByUser(db, user.id);
            let sharedNotes = await fetchSharedNotesByUser(db, user.id);

            // Filter out archived notes
            notes = notes.filter(note => !note.archived_at);
            sharedNotes = sharedNotes.filter(note => !note.archived_at);

            res.render('index', { user, notes, sharedNotes });
        } catch (err) {
            console.error(err);
            res.render('index', { user, notes: [], sharedNotes: [] });
        }
    });
}
