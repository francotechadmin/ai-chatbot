'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusIcon, FileIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { hasRole } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define user type
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superuser';
  status: 'active' | 'inactive' | 'pending';
  lastActive?: Date;
  createdAt?: Date;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  
  // Redirect if not admin
  useEffect(() => {
    if (session && !hasRole(session, 'admin')) {
      redirect('/dashboard');
    }
  }, [session]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });
  
  // Handle user update
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole || editingUser.role,
          status: newStatus || editingUser.status,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, role: (newRole || user.role) as any, status: (newStatus || user.status) as any } 
          : user
      ));
      
      toast.success('User updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };
  
  // Calculate time since for last active
  const getTimeSince = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };
  
  // Count active users (active in last 30 days)
  const activeUsers = users.filter(user => {
    if (!user.lastActive) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(user.lastActive) > thirtyDaysAgo;
  });
  
  // Count pending users
  const pendingUsers = users.filter(user => user.status === 'pending');

  if (loading) {
    return <div className="container mx-auto p-6">Loading user data...</div>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Users">
          <Button variant="outline">
            <FileIcon size={16} />
            <span className="ml-2">Export Report</span>
          </Button>
          {hasRole(session, 'admin') && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusIcon size={16} />
              <span className="ml-2">Add User</span>
            </Button>
          )}
        </PageHeader>
        
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
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 w-full sm:w-48"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superuser">Superuser</option>
              </select>
            </div>
            
            {/* Desktop view - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Email</th>
                    <th className="py-3 px-4 text-left font-medium">Role</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Last Active</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'superuser' ? 'bg-red-100 text-red-800' : 
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getTimeSince(user.lastActive)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                              setNewStatus(user.status);
                              setEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          {user.status === 'active' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/users/${user.id}`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      status: 'inactive',
                                    }),
                                  });
                                  
                                  if (!response.ok) throw new Error('Failed to update user');
                                  
                                  // Update local state
                                  setUsers(users.map(u => 
                                    u.id === user.id ? { ...u, status: 'inactive' } : u
                                  ));
                                  
                                  toast.success('User disabled successfully');
                                } catch (error) {
                                  console.error('Error disabling user:', error);
                                  toast.error('Failed to disable user');
                                }
                              }}
                            >
                              Disable
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-500"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/users/${user.id}`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      status: 'active',
                                    }),
                                  });
                                  
                                  if (!response.ok) throw new Error('Failed to update user');
                                  
                                  // Update local state
                                  setUsers(users.map(u => 
                                    u.id === user.id ? { ...u, status: 'active' } : u
                                  ));
                                  
                                  toast.success('User enabled successfully');
                                } catch (error) {
                                  console.error('Error enabling user:', error);
                                  toast.error('Failed to enable user');
                                }
                              }}
                            >
                              Enable
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{user.email}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'superuser' ? 'bg-red-100 text-red-800' : 
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className="text-muted-foreground">Last Active:</span>
                    <span>{getTimeSince(user.lastActive)}</span>
                  </div>
                  
                  <div className="pt-2 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingUser(user);
                        setNewRole(user.role);
                        setNewStatus(user.status);
                        setEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    {user.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-500"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/users/${user.id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                status: 'inactive',
                              }),
                            });
                            
                            if (!response.ok) throw new Error('Failed to update user');
                            
                            // Update local state
                            setUsers(users.map(u => 
                              u.id === user.id ? { ...u, status: 'inactive' } : u
                            ));
                            
                            toast.success('User disabled successfully');
                          } catch (error) {
                            console.error('Error disabling user:', error);
                            toast.error('Failed to disable user');
                          }
                        }}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-green-500"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/users/${user.id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                status: 'active',
                              }),
                            });
                            
                            if (!response.ok) throw new Error('Failed to update user');
                            
                            // Update local state
                            setUsers(users.map(u => 
                              u.id === user.id ? { ...u, status: 'active' } : u
                            ));
                            
                            toast.success('User enabled successfully');
                          } catch (error) {
                            console.error('Error enabling user:', error);
                            toast.error('Failed to enable user');
                          }
                        }}
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No users found matching your search.</p>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
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
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and status. Note that only superusers can promote users to admin or superuser roles.
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  className="col-span-3"
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newRole}
                  onValueChange={setNewRole}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin" disabled={!hasRole(session, 'superuser')}>Admin</SelectItem>
                    <SelectItem value="superuser" disabled={!hasRole(session, 'superuser')}>Superuser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user with active status. The user will be able to log in immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-email" className="text-right">
                Email
              </Label>
              <Input
                id="new-email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-role" className="text-right">
                Role
              </Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({...newUserData, role: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin" disabled={!hasRole(session, 'superuser')}>Admin</SelectItem>
                  <SelectItem value="superuser" disabled={!hasRole(session, 'superuser')}>Superuser</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              try {
                // Validate inputs
                if (!newUserData.email || !newUserData.password) {
                  toast.error('Email and password are required');
                  return;
                }
                
                // Create user with active status
                const response = await fetch('/api/users', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: newUserData.email,
                    password: newUserData.password,
                    role: newUserData.role,
                    status: 'active', // Admin-created users are active by default
                  }),
                });
                
                if (!response.ok) throw new Error('Failed to create user');
                
                const newUser = await response.json();
                
                // Update local state
                setUsers([...users, newUser]);
                
                // Reset form and close dialog
                setNewUserData({
                  email: '',
                  password: '',
                  role: 'user',
                });
                setAddDialogOpen(false);
                
                toast.success('User created successfully');
              } catch (error) {
                console.error('Error creating user:', error);
                toast.error('Failed to create user');
              }
            }}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  );
}
