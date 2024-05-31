import { fetchNotesByUser, fetchSharedNotesByUser } from '../services/notes.service.mjs';

export function loadHomeController(app) {
    app.get('/', async (req, res) => {
        const { user } = req.session;
        
        if (!user) {
            return res.render('index', { user, notes: [], sharedNotes: [] });
        }
        
        try {
            const db = app.get('g:db');
            const notes = await fetchNotesByUser(db, user.id);
            const sharedNotes = await fetchSharedNotesByUser(db, user.id);
            res.render('index', { user, notes, sharedNotes });
        } catch (err) {
            console.error(err);
            res.render('index', { user, notes: [], sharedNotes: [] });
        }
    });
}
