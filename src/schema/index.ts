/**
 * Barrel file for schema exports.
 *
 * Re-exports public symbols from schema modules in this directory so consumers
 * can import from the schema entry point (e.g. `import { User } from './schema'`).
 *
 * When adding a new module, add a corresponding `export * from './name';`
 * Prefer named/type-only exports and avoid modules with import-side effects.
 */

export * from './goal';
export * from './notification';
export * from './organization';
export * from './points';
export * from './reward';
export * from './task';
export * from './user';
