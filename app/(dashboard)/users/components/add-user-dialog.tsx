'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser as createUserAction } from '../actions';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    role: 'user',
  });

  const handleInputChange = (field: string, value: string) => {
    setNewUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateUser = async () => {
    try {
      if (!newUserData.email || !newUserData.password) {
        toast.error('Email and password are required');
        return;
      }

      await createUserAction({
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role as 'user' | 'admin' | 'superuser'
      });
      
      toast.success('User created successfully');
      
      // Reset form and close dialog
      setNewUserData({
        email: '',
        password: '',
        role: 'user',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with specified role and permissions.
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
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-role" className="text-right">
              Role
            </Label>
            <Select
              value={newUserData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger className="col-span-3" id="new-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superuser">Superuser</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleCreateUser}>Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}