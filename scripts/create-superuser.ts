import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create database connection
const client = postgres(process.env.POSTGRES_URL || '');
const db = drizzle(client);

async function createSuperuser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);
  
  try {
    // Check if user exists
    const existingUser = await db.select().from(user).where(eq(user.email, email));
    
    if (existingUser.length > 0) {
      // Update existing user to superuser
      await db.update(user)
        .set({ role: 'superuser' })
        .where(eq(user.email, email));
      
      console.log(`User ${email} updated to superuser`);
    } else {
      // Create new superuser
      await db.insert(user).values({
        email,
        password: hash,
        role: 'superuser',
        status: 'active'
      });
      
      console.log(`Superuser ${email} created`);
    }
  } catch (error) {
    console.error('Failed to create superuser:', error);
  }
}

// Usage: node -r ts-node/register scripts/create-superuser.ts admin@example.com password123
const [email, password] = process.argv.slice(2);
if (email && password) {
  createSuperuser(email, password);
} else {
  console.error('Usage: node -r ts-node/register scripts/create-superuser.ts <email> <password>');
}
