'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusIcon, FileIcon } from '@/components/icons';
import { hasRole } from '@/lib/rbac';
import { User } from '../actions';
import { UserFilters } from './user-filters';
import { UserTable } from './user-table';
import { EditUserDialog } from './edit-user-dialog';
import { AddUserDialog } from './add-user-dialog';

interface UserManagementProps {
  initialUsers: User[];
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Handle filtering
  const handleFiltered = (filtered: User[]) => {
    setFilteredUsers(filtered);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div></div> {/* Empty div for flex spacing */}
        <div className="flex gap-2">
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
        </div>
      </div>

      <UserFilters users={users} onFiltered={handleFiltered} />
      
      <UserTable 
        users={filteredUsers} 
        onEditUser={handleEditUser} 
      />
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Dialogs */}
      <EditUserDialog 
        user={editingUser} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
      
      <AddUserDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </>
  );
}