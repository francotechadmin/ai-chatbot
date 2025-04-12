'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusIcon, MessageIcon, FileIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';

// Mock data for users
const users = [
  { 
    id: '1', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com', 
    role: 'Admin',
    status: 'Active',
    lastActive: '2 hours ago',
    dateJoined: 'Jan 15, 2023'
  },
  { 
    id: '2', 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    role: 'Editor',
    status: 'Active',
    lastActive: '5 minutes ago',
    dateJoined: 'Mar 22, 2023'
  },
  { 
    id: '3', 
    name: 'Alice Johnson', 
    email: 'alice@example.com', 
    role: 'Viewer',
    status: 'Inactive',
    lastActive: '3 days ago',
    dateJoined: 'Apr 10, 2023'
  },
  { 
    id: '4', 
    name: 'Robert Williams', 
    email: 'robert@example.com', 
    role: 'Editor',
    status: 'Active',
    lastActive: 'Just now',
    dateJoined: 'Feb 03, 2023'
  },
  { 
    id: '5', 
    name: 'Sarah Peterson', 
    email: 'sarah@example.com', 
    role: 'Viewer',
    status: 'Pending',
    lastActive: 'Never',
    dateJoined: 'Jun 18, 2023'
  }
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Users">
          <Button variant="outline">
            <FileIcon size={16} />
            <span className="ml-2">Export Report</span>
          </Button>
          <Button>
            <PlusIcon size={16} />
            <span className="ml-2">New Session</span>
          </Button>
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
            <CardContent className="text-3xl font-bold">4</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>New user requests</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">1</CardContent>
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
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            
            {/* Desktop view - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Email</th>
                    <th className="py-3 px-4 text-left font-medium">Role</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Last Active</th>
                    <th className="py-3 px-4 text-left font-medium">Date Joined</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'Editor' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.lastActive}</td>
                      <td className="py-3 px-4">{user.dateJoined}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-500">Disable</Button>
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
                    <h3 className="font-medium">{user.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="truncate">{user.email}</span>
                    <span className="text-muted-foreground">Role:</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-red-100 text-red-800' : 
                      user.role === 'Editor' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-muted-foreground">Last Active:</span>
                    <span>{user.lastActive}</span>
                    <span className="text-muted-foreground">Date Joined:</span>
                    <span>{user.dateJoined}</span>
                  </div>
                  
                  <div className="pt-2 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-500">Disable</Button>
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
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure access rights for each role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Admin</div>
                  <p className="text-sm text-muted-foreground">Full system access including user management, settings, and all knowledge operations.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Editor</div>
                  <p className="text-sm text-muted-foreground">Can create, edit, and approve knowledge entries. Cannot access user management or system settings.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Viewer</div>
                  <p className="text-sm text-muted-foreground">Read-only access to approved knowledge. Cannot modify content or access administrative functions.</p>
                </div>
                
                <Button variant="outline" className="w-full mt-2">
                  Configure Roles
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Recent user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileIcon size={16} />
                  </div>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <p className="text-sm text-muted-foreground">Added new knowledge entry: &quot;Product Documentation&quot;</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                    <PlusIcon size={16} />
                  </div>
                  <div>
                    <div className="font-medium">Jane Smith</div>
                    <p className="text-sm text-muted-foreground">Approved knowledge entry: &quot;Technical Specifications&quot;</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageIcon size={16} />
                  </div>
                  <div>
                    <div className="font-medium">Robert Williams</div>
                    <p className="text-sm text-muted-foreground">Created new query session</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-2">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 