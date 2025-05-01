import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Check if we're in production or development
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Create postgres connection
const client = postgres(connectionString, {
  max: 1,
});

// Create drizzle client
export const db = drizzle(client, { schema });

// Export schema
export * from './schema';

// Export queries
export * from './queries';