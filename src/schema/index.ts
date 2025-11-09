/**
 * Barrel file for schema exports.
 *
 * Re-exports public symbols from schema modules in this directory so consumers
 * can import from the schema entry point (e.g. `import { User } from './schema'`).
 *
 * When adding a new module, add a corresponding `export * from './name';`
 * Prefer named/type-only exports and avoid modules with import-side effects.
 */

// Legacy tables (to be removed)
export * from './counter';

// Enums
export * from './enums';
export * from './group';
export * from './groupMember';
// Relations
export * from './relations';
export * from './reward';

export * from './task';

// Tables
export * from './user';
export * from './user';
