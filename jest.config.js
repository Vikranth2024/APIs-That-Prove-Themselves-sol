// jest.config.js
//
// ✅ FIX 1: testEnvironment changed from 'browser' to 'node'.
// Node.js APIs required by Supertest (http, net, etc.) are now available.

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',     // ✅ correct
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
};

module.exports = config;
