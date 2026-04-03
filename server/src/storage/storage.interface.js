/**
 * Storage Interface (JSDoc contract)
 * All storage implementations must expose these methods.
 *
 * @typedef {Object} IStorage
 * @property {function(string, Buffer): Promise<void>} save   - Saves a buffer to the given relative path
 * @property {function(string): string}               getPath - Returns the absolute path for a relative path
 * @property {function(string): Promise<void>}        delete  - Deletes the file at the given relative path
 */

// This file is intentionally empty — it documents the interface via JSDoc only.
// Implementations: local.storage.js (MVP), s3.storage.js (Phase 2)

module.exports = {};
