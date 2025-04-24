import { redirect } from 'next/navigation';
import { auth } from './(auth)/auth';

export default async function RootPage() {
  const session = await auth();
  
  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  
  // If user is not logged in, redirect to login page
  redirect('/login');
}
