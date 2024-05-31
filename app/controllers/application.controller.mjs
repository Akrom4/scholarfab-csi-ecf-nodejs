import {
  fetchNoteById,
  updateNote,
  createNote,
  fetchNotesByUser,
  fetchNotesSharedByUser,
  archiveNote,
} from "../services/notes.service.mjs";
import { formatDate } from "../helpers/dateHelper.mjs";
import {
  createShare,
  fetchShareByNoteAndUser,
  fetchSharesByNote,
  revokeShare,
  revokeSharesByNote,
} from "../services/share.service.mjs";
import { fetchAllUsers } from "../services/user.service.mjs";

// Handles rendering the form to create a new note
async function handleCreateNoteForm(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    res.render("createNote");
  } catch (err) {
    res.redirect("/login");
  }
}

// Handles saving a new note to the database
async function handleSaveNote(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    const { title, content } = req.body;
    const note = await createNote(db, { title, content, ownerId: user.id });
    res.redirect("/");
  } catch (err) {
    res.redirect("/login");
  }
}

// Handles viewing a specific note, checking if the user has permission
async function handleViewNote(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const { id } = req.params;
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    const note = await fetchNoteById(db, id);
    if (note.owner_id !== user.id) {
      const share = await fetchShareByNoteAndUser(db, {
        noteId: id,
        userId: user.id,
      });
      if (!share || (share.perm !== "rw" && share.perm !== "ro")) {
        return res.redirect("/");
      }
    }
    const formattedCreatedAt = formatDate(note.created_at);
    const formattedUpdatedAt = formatDate(note.updated_at);
    res.render("viewNote", {
      note,
      date: formattedCreatedAt,
      updatedAt: formattedUpdatedAt,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
}

// Handles rendering the form to edit a note, checking if the user has permission
async function handleEditNoteForm(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const { id } = req.params;
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    const note = await fetchNoteById(db, id);
    if (note.owner_id !== user.id) {
      const share = await fetchShareByNoteAndUser(db, {
        noteId: id,
        userId: user.id,
      });
      if (!share || share.perm !== "rw") {
        return res.redirect("/");
      }
    }
    res.render("editNote", { note });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
}

// Handles updating a specific note in the database
async function handleUpdateNote(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const { id } = req.params;
  const { title, content } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    const note = await fetchNoteById(db, id);
    if (note.owner_id !== user.id) {
      const share = await fetchShareByNoteAndUser(db, {
        noteId: id,
        userId: user.id,
      });
      if (!share || share.perm !== "rw") {
        return res.redirect("/");
      }
    }
    await updateNote(db, { id, title, content });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
}

// Handles managing shares, displaying personal and shared notes, and available users
async function handleManageShares(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    const personalNotes = await fetchNotesByUser(db, user.id);
    const sharedNotes = await fetchNotesSharedByUser(db, user.id);
    const users = await fetchAllUsers(db);
    const shares = await fetchSharesByNote(db, user.id);

    // Exclude the active user from the users list
    const filteredUsers = users.filter((u) => u.id !== user.id);

    res.render("shares", {
      user,
      personalNotes,
      sharedNotes,
      users: filteredUsers,
      shares,
    });
  } catch (err) {
    console.error("Failed to manage shares:", err);
    res.redirect("/");
  }
}

// Handles creating a new share for a note
async function handleCreateShare(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  const { noteId, userId, permission } = req.body;

  try {
    await createShare(db, { noteId, userId, permission });
    res.redirect("/shares");
  } catch (err) {
    console.error("Failed to create share:", err);
    res.redirect("/shares");
  }
}

// Handles revoking an existing share
async function handleRevokeShare(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  const { shareId } = req.params;

  try {
    await revokeShare(db, shareId);
    res.redirect("/shares");
  } catch (err) {
    console.error("Failed to revoke share:", err);
    res.redirect("/shares");
  }
}
// Handles archiving a note, removing all shares, and marking the note as archived
async function handleArchiveNote(req, res) {
  const { app } = req;
  const db = app.get("g:db");
  const { id } = req.params;
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  try {
    const note = await fetchNoteById(db, id);
    if (note.owner_id !== user.id) {
      return res.redirect("/");
    }

    await revokeSharesByNote(db, id); // Revoke all shares for the note
    await archiveNote(db, id); // Archive the note
    res.redirect("/");
  } catch (err) {
    console.error("Failed to archive note:", err);
    res.redirect("/");
  }
}

// Loads the application routes for note and share handling
export function loadApplicationController(app) {
  app.get("/note", handleCreateNoteForm);
  app.post("/note", handleSaveNote);
  app.get("/note/:id", handleViewNote);
  app.get("/note/:id/edit", handleEditNoteForm);
  app.post("/note/:id/edit", handleUpdateNote);
  app.get("/note/:id/archive", handleArchiveNote);
  app.post("/share", handleCreateShare);
  app.get("/shares", handleManageShares);
  app.get("/share/:shareId/revoke", handleRevokeShare);
}
