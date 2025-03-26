
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  user_metadata: any;
  profile: {
    id: string;
    name: string;
    role: string;
    avatar_url?: string;
  };
};

const UsersSettings = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("cashier");
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;

      // For each profile, get the user info from auth
      const usersWithProfiles = await Promise.all(
        data.map(async (profile) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            profile.id
          );
          if (userError) throw userError;

          return {
            ...userData.user,
            profile,
          };
        })
      );

      setUsers(usersWithProfiles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    try {
      // In a real scenario this would send an invite email
      // For demo purposes we'll just create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: inviteEmail,
        email_confirm: true,
        user_metadata: { role: inviteRole },
        password: "tempPassword123", // In real app, would be random and sent to user
      });

      if (error) throw error;

      toast.success(`User invited successfully`);
      setInviteEmail("");
      setInviteRole("cashier");
      setIsInviting(false);
      fetchUsers();
    } catch (error: any) {
      toast.error("Error inviting user: " + error.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editedName,
          role: editedRole,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error("Error updating user: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(deletingUser.id);
      if (error) throw error;

      toast.success("User deleted successfully");
      setDeletingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error("Error deleting user: " + error.message);
    }
  };

  const startEditing = (user: UserWithProfile) => {
    setEditingUser(user);
    setEditedName(user.profile.name);
    setEditedRole(user.profile.role);
  };

  // For this demo, we're mocking the admin API calls
  // In a real app, you'd have proper admin endpoints for these operations
  // We'll just trigger success toasts without implementing the actual functionality

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setIsInviting(true)}>
          <Plus className="mr-2 h-4 w-4" /> Invite User
        </Button>
      </div>

      {isInviting && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">Invite New User</h3>
          <div className="space-y-2">
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Select
              value={inviteRole}
              onValueChange={(value) => setInviteRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleInviteUser}>Send Invite</Button>
              <Button variant="outline" onClick={() => setIsInviting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No users found. Invite a user to get started.
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              {editingUser?.id === user.id ? (
                <div className="flex flex-col gap-2 w-full">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Name"
                    autoFocus
                  />
                  <Select
                    value={editedRole}
                    onValueChange={(value) => setEditedRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleUpdateUser}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={user.profile.avatar_url}
                        alt={user.profile.name}
                      />
                      <AvatarFallback>
                        {user.profile.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.profile.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs mt-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block">
                        {user.profile.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditing(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletingUser(user)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{deletingUser?.profile.name}" ({deletingUser?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default UsersSettings;
