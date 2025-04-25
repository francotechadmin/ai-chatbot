const { config } = require('dotenv');
const postgres = require('postgres');

config({
  path: '.env.local',
});

async function installPgvector() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined');
    process.exit(1);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    console.log('Checking if pgvector is installed...');
    
    // Check if pgvector extension is installed
    const vectorResult = await connection`SELECT * FROM pg_extension WHERE extname = 'vector'`;
    if (vectorResult.length > 0) {
      console.log('✅ pgvector extension is already installed');
      process.exit(0);
    }
    
    console.log('❌ pgvector extension is not installed');
    console.log('Attempting to install pgvector extension...');
    
    try {
      // Try to create the extension
      await connection`CREATE EXTENSION vector`;
      console.log('✅ pgvector extension installed successfully');
    } catch (error) {
      console.error('Failed to install pgvector extension:', error);
      console.log('\n');
      console.log('To install pgvector, you need to:');
      console.log('1. Install the pgvector extension on your PostgreSQL server');
      console.log('   - For Debian/Ubuntu: sudo apt-get install postgresql-15-pgvector');
      console.log('   - For macOS with Homebrew: brew install pgvector');
      console.log('   - For other systems, see: https://github.com/pgvector/pgvector#installation');
      console.log('2. Connect to your PostgreSQL server as a superuser');
      console.log('3. Run: CREATE EXTENSION vector;');
      console.log('\n');
      console.log('If you are using a managed PostgreSQL service (like Vercel Postgres):');
      console.log('1. Check if the service supports pgvector');
      console.log('2. Enable the extension through the service\'s dashboard or API');
      console.log('3. If not supported, consider using a different PostgreSQL service that supports pgvector');
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await connection.end();
  }
}

installPgvector();
