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

  let connection: any;
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
    
    // Check database state before migrations
    try {
      console.log('🔍 Checking database state before migrations...');
      
      // Check if User table exists
      const tableExists = await connection`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'User'
        ) as exists
      `;
      
      if (tableExists[0].exists) {
        console.log('✅ User table exists');
        
        // Check User table columns
        const userColumns = await connection`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'User'
        `;
        
        console.log('📊 Current User table columns:', userColumns.map((c: any) => `${c.column_name} (${c.data_type})`).join(', '));
        
        // Check specifically for role column
        const roleExists = userColumns.some((col: any) => col.column_name === 'role');
        console.log(`${roleExists ? '✅' : '❌'} Role column ${roleExists ? 'exists' : 'does not exist'}`);
      } else {
        console.log('❌ User table does not exist yet');
      }
      
      // Check applied migrations
      try {
        const appliedMigrations = await connection`
          SELECT migration_name FROM drizzle.__drizzle_migrations ORDER BY id
        `;
        console.log('📜 Applied migrations:', appliedMigrations.map((m: any) => m.migration_name).join(', '));
      } catch (e: any) {
        console.log('ℹ️ No migrations table found yet');
      }
      
    } catch (checkError: any) {
      console.log('⚠️ Error checking database state:', checkError.message);
      // Continue with migrations anyway
    }
    
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
    
    // Run migrations with better error handling
    try {
      await migrate(db, { 
        migrationsFolder: './lib/db/migrations',
        migrationsTable: '__drizzle_migrations'
      });
      
      const end = Date.now();
      console.log('✅ Migrations completed in', end - start, 'ms');
    } catch (migrateError: any) {
      console.error('❌ Migration execution failed');
      console.error(migrateError);
      
      // Try to determine which migration failed
      if (migrateError.message?.includes('role')) {
        console.log('🔄 Attempting to fix User table role column issue...');
        
        // Try to manually apply the fix for the role column
        try {
          await connection`
            DO $$ 
            BEGIN
              IF EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'User'
              ) AND NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
              ) THEN
                ALTER TABLE "User" ADD COLUMN "role" VARCHAR CHECK ("role" IN ('user', 'admin', 'superuser')) NOT NULL DEFAULT 'user';
              END IF;
              
              IF EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'User'
              ) AND NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'status'
              ) THEN
                ALTER TABLE "User" ADD COLUMN "status" VARCHAR CHECK ("status" IN ('active', 'inactive', 'pending')) NOT NULL DEFAULT 'active';
              END IF;
              
              IF EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'User'
              ) AND NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'lastActive'
              ) THEN
                ALTER TABLE "User" ADD COLUMN "lastActive" TIMESTAMP;
              END IF;
            END $$;
          `;
          console.log('✅ Manual fix for role column applied');
          
          // Try migrations again
          console.log('🔄 Retrying migrations...');
          await migrate(db, { 
            migrationsFolder: './lib/db/migrations',
            migrationsTable: '__drizzle_migrations'
          });
          
          const retryEnd = Date.now();
          console.log('✅ Migrations completed after retry in', retryEnd - start, 'ms');
        } catch (retryError: any) {
          console.error('❌ Manual fix and retry failed:', retryError.message);
          throw retryError;
        }
      } else {
        throw migrateError;
      }
    }
    
    // Verify User table structure after migrations
    try {
      const userColumns = await connection`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'User'
      `;
      console.log('✅ User table columns after migration:', userColumns.map((c: any) => `${c.column_name} (${c.data_type})`).join(', '));
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
    if (err.query) {
      console.error(`Failed query: ${err.query}`);
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
