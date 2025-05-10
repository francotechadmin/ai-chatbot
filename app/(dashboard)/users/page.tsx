import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/rbac';
import { ProtectedRoute } from '@/components/protected-route';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUsers } from './actions';
import { UserManagement } from './components/user-management';

export default async function UsersPage() {
  try {
    console.log('UsersPage: Starting page render');
    
    // Check authentication and authorization on the server
    console.log('UsersPage: Getting auth session');
    const session = await auth();
    console.log('UsersPage: Auth session obtained', { hasSession: !!session });
    
    if (!session || !hasRole(session, 'admin')) {
      console.log('UsersPage: Unauthorized - redirecting');
      redirect('/dashboard');
    }
    
    // Wrap the data fetching in a try/catch to handle errors
    console.log('UsersPage: Fetching users data');
    const users = await getUsers();
    console.log(`UsersPage: Successfully fetched ${users.length} users`);
    
    // Calculate user statistics
    console.log('UsersPage: Calculating user statistics');
    const activeUsers = users.filter(user => {
      if (!user.lastActive) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(user.lastActive) > thirtyDaysAgo;
    });
    
    console.log(`UsersPage: Found ${activeUsers.length} active users`);
    
    const pendingUsers = users.filter(user => user.status === 'pending');
    console.log(`UsersPage: Found ${pendingUsers.length} pending users`);

    return (
      <ProtectedRoute requiredRole="admin">
        <div className="container mx-auto p-6">
          <div className="flex flex-col gap-6">
            <PageHeader title="Users" />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>Registered in system</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{users.length}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{activeUsers.length}</CardContent>
              </Card>
              <Card className={pendingUsers.length > 0 ? "border-yellow-500 shadow-md" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>New user requests</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {pendingUsers.length}
                  {pendingUsers.length > 0 && (
                    <p className="text-sm font-normal text-yellow-600 mt-2">
                      Users waiting for approval
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading user management...</div>}>
                  <UserManagement initialUsers={users} />
                </Suspense>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                  <CardDescription>Access rights for each role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium">Superuser</div>
                      <p className="text-sm text-muted-foreground">Complete system access including user management, role assignment, system settings, and all knowledge operations.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium">Admin</div>
                      <p className="text-sm text-muted-foreground">Administrative access including user management (except role promotion to admin/superuser), knowledge approval, and content management.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium">User</div>
                      <p className="text-sm text-muted-foreground">Standard access to query and capture knowledge, view approved content, and manage personal settings.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Recent user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Activity tracking will be implemented in a future update.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Error in UsersPage:', error);
    throw error; // This will be caught by the error.tsx boundary
  }
}
