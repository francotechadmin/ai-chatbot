const { config } = require('dotenv');
const postgres = require('postgres');

config({
  path: '.env.local',
});

async function checkDatabase() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined');
    process.exit(1);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    console.log('Checking database connection...');
    
    // Check if we can connect to the database
    const result = await connection`SELECT version()`;
    console.log('Connected to PostgreSQL:', result[0].version);
    
    // Check if pgvector extension is installed
    try {
      const vectorResult = await connection`SELECT * FROM pg_extension WHERE extname = 'vector'`;
      if (vectorResult.length > 0) {
        console.log('pgvector extension is installed');
      } else {
        console.log('pgvector extension is NOT installed');
      }
    } catch (error) {
      console.error('Error checking pgvector extension:', error);
    }
    
    // Check if the KnowledgeSource table exists
    try {
      const tableResult = await connection`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;
      
      console.log('Tables in the database:');
      tableResult.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
      
      // Check specifically for KnowledgeSource
      const knowledgeSourceExists = tableResult.some(row => row.table_name === 'KnowledgeSource');
      console.log(`KnowledgeSource table exists: ${knowledgeSourceExists}`);
      
    } catch (error) {
      console.error('Error checking tables:', error);
    }
    
    // Check drizzle migrations table
    try {
      const migrationsResult = await connection`
        SELECT * FROM drizzle.__drizzle_migrations ORDER BY id
      `;
      
      console.log('\nMigrations applied:');
      migrationsResult.forEach(row => {
        try {
          const dateStr = new Date(row.created_at).toISOString();
          console.log(`- ${row.migration_name} (${dateStr})`);
        } catch (err) {
          console.log(`- ${row.migration_name} (date invalid)`);
        }
      });
      
    } catch (error) {
      console.error('Error checking migrations:', error);
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

checkDatabase();
