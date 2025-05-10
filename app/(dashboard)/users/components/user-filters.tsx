'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { User } from '../actions';

interface UserFiltersProps {
  users: User[];
  onFiltered: (filteredUsers: User[]) => void;
}

export function UserFilters({ users, onFiltered }: UserFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    // Filter users based on search query and selected role
    const filtered = users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'All' || user.role === selectedRole.toLowerCase();
      return matchesSearch && matchesRole;
    });
    
    onFiltered(filtered);
  }, [searchQuery, selectedRole, users]);

  return (
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
  );
}