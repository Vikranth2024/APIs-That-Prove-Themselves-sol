// src/routes/notes.js

const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/notes
// Creates a new note
router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // ✅ FIX: Validate that title exists and is not an empty string.
    // Missing title or empty string both return 422 Unprocessable Entity.
    if (!title || title.trim() === '') {
      return res.status(422).json({
        message: 'Title is required and cannot be empty.'
      });
    }

    const note = await prisma.note.create({
      data: { title: title.trim(), content }
    });

    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
// Returns a single note by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // ✅ Handle non-numeric IDs before hitting the DB
    if (isNaN(id)) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const note = await prisma.note.findUnique({
      where: { id }
    });

    if (!note) {
      // ✅ FIX: Use 'message' key, not 'error'. Matches the API contract.
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ note });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
