import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load environment variables
config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  let connection;
  try {
    // Create a connection with a timeout and better error handling
    connection = postgres(process.env.POSTGRES_URL, { 
      max: 1,
      timeout: 10000, // 10 second timeout
      debug: true, // Enable debug logging
    });
    
    // Test the connection before proceeding
    console.log('🔄 Testing database connection...');
    await connection`SELECT 1`;
    console.log('✅ Database connection successful');
    
    const db = drizzle(connection);

    // Check if the drizzle schema exists
    try {
      await connection`CREATE SCHEMA IF NOT EXISTS drizzle`;
      console.log('✅ Drizzle schema check completed');
    } catch (schemaError: any) {
      console.log('ℹ️ Schema already exists or other schema error:', schemaError.message);
      // Continue execution, as this might just be a notice that the schema already exists
    }

    console.log('⏳ Running migrations...');

    const start = Date.now();
    await migrate(db, { 
      migrationsFolder: './lib/db/migrations',
      migrationsTable: '__drizzle_migrations'
    });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    
    // Verify User table structure after migrations
    try {
      const userColumns = await connection`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'User'
      `;
      console.log('✅ User table columns after migration:', userColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    } catch (verifyError: any) {
      console.log('⚠️ Could not verify User table structure:', verifyError.message);
    }
    
  } catch (err: any) {
    console.error('❌ Migration failed');
    console.error(err);
    
    // Additional diagnostic information
    if (err.code) {
      console.error(`Error code: ${err.code}`);
    }
    if (err.message) {
      console.error(`Error message: ${err.message}`);
    }
    if (err.detail) {
      console.error(`Error detail: ${err.detail}`);
    }
    
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
    // Don't exit the process here, let the caller handle it
  }
};

runMigrate().then(() => {
  console.log('✅ Migration process completed successfully');
  process.exit(0);
}).catch((err: any) => {
  console.error('❌ Migration process failed');
  if (err.message) {
    console.error(`Error message: ${err.message}`);
  }
  process.exit(1);
});
