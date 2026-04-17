# NoteFlow API — Testing Challenge (Fixed Solution)

**NoteFlow** is a simple note-taking API. This is the reference solution with all six flaws corrected and all five tests passing.

---

## What Was Fixed

| File | Flaw | Fix applied |
|---|---|---|
| `jest.config.js` | `testEnvironment: 'browser'` | Changed to `'node'` |
| `notes.test.js` | Happy path POST: expected `200` | Corrected to `201` |
| `notes.test.js` | Happy path GET: checked `res.body.data.note` | Corrected to `res.body.note` |
| `notes.test.js` | Failure path GET: no mock for null case | Added `mockResolvedValue(null)` |
| `notes.test.js` | Failure path POST: expected `400` | Corrected to `422` |
| `notes.test.js` | Edge case: no `beforeEach` mock reset | Added `beforeEach(() => jest.clearAllMocks())` |
| `src/routes/notes.js` | No title validation | Added `!title \|\| title.trim() === ''` check returning `422` |
| `src/routes/notes.js` | `404` body used `error` key | Changed to `message` key |

---

## Setup

```bash
npm install
npm test
```

All 5 tests should pass:

```
PASS __tests__/notes.test.js
  Happy Path
    ✓ POST /api/notes — creates a note and returns 201
    ✓ GET /api/notes/:id — returns an existing note with 200
  Failure Path
    ✓ GET /api/notes/:id — returns 404 when note does not exist
    ✓ POST /api/notes — returns 422 when title is missing
  Edge Cases
    ✓ POST /api/notes — returns 422 when title is an empty string
    ✓ GET /api/notes/:id — returns 404 for non-numeric ID

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

---

## The Six Fixes Explained

### Fix 1 — jest.config.js: testEnvironment
Supertest uses Node.js HTTP internals (`http.createServer`). The browser environment does not have these. Every test failed with environment errors before this fix.

### Fix 2 — Happy path POST: status code
`201 Created` is the correct HTTP status for a successful resource creation. `200 OK` is for reads. This is a fundamental REST contract — violating it breaks any client that checks status codes.

### Fix 3 — Happy path GET: response path
The endpoint returns `{ note: {...} }`. The broken test checked `res.body.data.note` which does not exist — the assertion always failed even when the endpoint was working correctly.

### Fix 4 — Failure path GET: missing mock
`jest.fn()` returns `undefined` by default. `undefined` is falsy but the `if (!note)` check evaluates it as falsy correctly in JavaScript — however, without an explicit mock the findUnique call was returning `undefined` which passed the null check inconsistently depending on Jest version. Setting `mockResolvedValue(null)` makes the intent explicit and reliable across all environments.

### Fix 5 — Failure path POST: 422 vs 400
`400 Bad Request` means the request was syntactically malformed (e.g. invalid JSON). `422 Unprocessable Entity` means the request was syntactically valid but semantically wrong (e.g. valid JSON with a missing required field). A missing `title` field is a semantic error, not a syntax error.

### Fix 6 — Edge case: mock bleed between tests
Without `beforeEach(() => jest.clearAllMocks())`, mock return values set in earlier tests persist into later tests. The happy path GET test sets `findUnique` to return a note object. Without a reset, the edge case test for a non-numeric ID also returned a note — making the endpoint appear to return 200 when it should return 404.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/notes` | Create a new note |
| `GET` | `/api/notes/:id` | Get a note by ID |
| `GET` | `/health` | Health check |
