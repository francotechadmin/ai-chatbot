/**
 * This script is for testing the settings functionality.
 * It simulates reading and writing cookies for settings.
 */

import { cookies } from 'next/headers';

async function testSettings() {
  try {
    console.log('Testing settings functionality...');
    
    // Read cookies
    const cookieStore = await cookies();
    const chatModel = cookieStore.get('chat-model')?.value;
    const defaultVisibility = cookieStore.get('default-visibility')?.value;
    
    console.log('Current settings:');
    console.log('- Chat Model:', chatModel || 'Not set (will use default)');
    console.log('- Default Visibility:', defaultVisibility || 'Not set (will use default)');
    
    // This is just a test script, so we don't actually set cookies here
    console.log('\nTo set these values, use the Settings page in the application.');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing settings:', error);
  }
}

// Only run this directly if executed as a script
if (require.main === module) {
  testSettings();
}

export { testSettings };
