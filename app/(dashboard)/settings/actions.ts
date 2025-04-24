'use server';

import { cookies } from 'next/headers';

/**
 * Save the default visibility preference as a cookie
 */
export async function saveDefaultVisibilityAsCookie(visibility: 'private' | 'public') {
  const cookieStore = await cookies();
  cookieStore.set('default-visibility', visibility);
}
