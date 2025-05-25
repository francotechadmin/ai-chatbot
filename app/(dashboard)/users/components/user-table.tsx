'use client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type User, updateUser as updateUserAction } from '../actions';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
}

export function UserTable({ users, onEditUser }: UserTableProps) {
  // Function to calculate time since for last active
  const getTimeSince = (date?: Date | null) => {
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

  // Handle enable/disable user
  const handleStatusChange = async (user: User, newStatus: 'active' | 'inactive') => {
    try {
      await updateUserAction({
        id: user.id,
        status: newStatus
      });
      
      toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error(`Error ${newStatus === 'active' ? 'enabling' : 'disabling'} user:`, error);
      toast.error(`Failed to ${newStatus === 'active' ? 'enable' : 'disable'} user`);
    }
  };

  return (
    <>
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
            {users.map((user) => (
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
                      onClick={() => onEditUser(user)}
                    >
                      Edit
                    </Button>
                    {user.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleStatusChange(user, 'inactive')}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-500"
                        onClick={() => handleStatusChange(user, 'active')}
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
        {users.map((user) => (
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
                onClick={() => onEditUser(user)}
              >
                Edit
              </Button>
              {user.status === 'active' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-red-500"
                  onClick={() => handleStatusChange(user, 'inactive')}
                >
                  Disable
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-green-500"
                  onClick={() => handleStatusChange(user, 'active')}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No users found matching your search.</p>
        </div>
      )}
    </>
  );
}