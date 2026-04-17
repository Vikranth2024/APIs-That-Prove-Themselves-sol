// __tests__/notes.test.js
//
// NoteFlow API — Test Suite (Fixed)
//
// All six flaws corrected. Each fix is annotated with ✅ FIX.

const request = require('supertest');
const app     = require('../src/app');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    note: {
      create:     jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ FIX 6: Reset all mocks before each test.
// Without this, a mock return value set in one test bleeds into the next.
// jest.clearAllMocks() resets return values AND call counts before every test.
beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────
// HAPPY PATH TESTS
// ─────────────────────────────────────────────
describe('Happy Path', () => {

  test('POST /api/notes — creates a note and returns 201', async () => {
    prisma.note.create.mockResolvedValue({
      id: 1,
      title: 'My First Note',
      content: 'Some content here',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'My First Note', content: 'Some content here' });

    // ✅ FIX 2: Corrected from 200 to 201.
    // POST that successfully creates a resource must return 201 Created.
    expect(res.statusCode).toBe(201);                    // ✅ was 200
    expect(res.body).toHaveProperty('note');
    expect(res.body.note.title).toBe('My First Note');
  });

  test('GET /api/notes/:id — returns an existing note with 200', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 1,
      title: 'My First Note',
      content: 'Some content here',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await request(app).get('/api/notes/1');

    expect(res.statusCode).toBe(200);

    // ✅ FIX 3: Corrected from res.body.data.note to res.body.note.
    // The endpoint returns { note: {...} } — not { data: { note: {...} } }.
    expect(res.body.note.title).toBe('My First Note');   // ✅ was res.body.data.note
  });

});

// ─────────────────────────────────────────────
// FAILURE PATH TESTS
// ─────────────────────────────────────────────
describe('Failure Path', () => {

  test('GET /api/notes/:id — returns 404 when note does not exist', async () => {
    // ✅ FIX 4: Mock set up to return null — simulates "not found" in DB.
    // Without this, jest.fn() returns undefined, which the endpoint
    // treats as truthy and returns 200 instead of 404.
    prisma.note.findUnique.mockResolvedValue(null);      // ✅ was missing

    const res = await request(app).get('/api/notes/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Note not found');
  });

  test('POST /api/notes — returns 422 when title is missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ content: 'Content without a title' });

    // ✅ FIX 5: Corrected from 400 to 422.
    // 422 Unprocessable Entity is the correct status when the request
    // body is understood but semantically invalid (missing required field).
    // 400 is for malformed syntax; 422 is for valid syntax, invalid content.
    expect(res.statusCode).toBe(422);                    // ✅ was 400
    expect(res.body).toHaveProperty('message');
  });

});

// ─────────────────────────────────────────────
// EDGE CASE TESTS
// ─────────────────────────────────────────────
describe('Edge Cases', () => {

  test('POST /api/notes — returns 422 when title is an empty string', async () => {
    // An empty string '' is not the same as a missing title field.
    // title.trim() === '' catches this case.
    const res = await request(app)
      .post('/api/notes')
      .send({ title: '', content: 'Content here' });

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/notes/:id — returns 404 for non-numeric ID', async () => {
    // ✅ Fix 6 (beforeEach) ensures no mock state bleeds from previous tests.
    // Number('not-a-number') is NaN — the endpoint handles this and returns 404.
    const res = await request(app).get('/api/notes/not-a-number');

    expect(res.statusCode).not.toBe(200);
    expect(res.statusCode).toBe(404);
  });

});
