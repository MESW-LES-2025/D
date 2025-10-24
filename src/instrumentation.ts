export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Run DB migrations
    await import('./utils/DBMigration');
  }
}
