import { createActiveUser } from '@/lib/db/queries';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const email = 'test@example.com';
    const password = 'password123';
    const role = 'user';
    
    await createActiveUser(email, password, role);
    
    console.log(`Test user created successfully: ${email}`);
    console.log('You can now log in with these credentials.');
  } catch (error) {
    console.error('Failed to create test user:', error);
  }
}

createTestUser();
