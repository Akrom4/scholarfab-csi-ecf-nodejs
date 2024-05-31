import { fetchNoteById, updateNote } from '../services/notes.service.mjs'
import { createNote } from '../services/notes.service.mjs'
import { formatDate } from '../helpers/dateHelper.mjs'

async function handleCreateNoteForm(req, res) {
    const { app } = req
    const db = app.get('g:db')
    const user = req.session.user

    if(!user) { return res.redirect('/login') }

    try {
        res.render('createNote')
    } catch(err) {
        res.redirect('/login')
    }
}

async function handleSaveNote(req, res) {
    const { app } = req
    const db = app.get('g:db')
    const user = req.session.user

    if(!user) { return res.redirect('/login') }

    try {
        const { title, content } = req.body
        const note = await createNote(db, { title, content, ownerId: user.id })
        res.redirect('/')
    } catch(err) {
        res.redirect('/login')
    }
}
async function handleViewNote(req, res) {
    const { app } = req;
    const db = app.get('g:db');
    const { id } = req.params;
    const user = req.session.user;

    if (!user) {
        return res.redirect('/login');
    }

    try {
        const note = await fetchNoteById(db, id);
        if (note.owner_id !== user.id) {
            return res.redirect('/');
        }
        const formattedCreatedAt = formatDate(note.created_at);
        const formattedUpdatedAt = formatDate(note.updated_at);
        res.render('viewNote', { note, date : formattedCreatedAt, updatedAt: formattedUpdatedAt});
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}

async function handleEditNoteForm(req, res) {
    const { app } = req;
    const db = app.get('g:db');
    const { id } = req.params;
    const user = req.session.user;

    if (!user) {
        return res.redirect('/login');
    }

    try {
        const note = await fetchNoteById(db, id);
        if (note.owner_id !== user.id) {
            return res.redirect('/');
        }
        res.render('editNote', { note });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}

async function handleUpdateNote(req, res) {
    const { app } = req;
    const db = app.get('g:db');
    const { id } = req.params;
    const { title, content } = req.body;
    const user = req.session.user;

    if (!user) {
        return res.redirect('/login');
    }

    try {
        await updateNote(db, { id, title, content, ownerId: user.id });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}

export function loadApplicationController(app) {
    // définir les routes de l'application ici ...
    app.get('/note', handleCreateNoteForm)
    app.post('/note', handleSaveNote)
    app.get('/note/:id', handleViewNote);
    app.get('/note/:id/edit', handleEditNoteForm);
    app.post('/note/:id/edit', handleUpdateNote);
}