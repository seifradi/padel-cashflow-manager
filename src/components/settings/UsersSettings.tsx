
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constants";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UsersSettings = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("cashier");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInviteUser = async () => {
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a production app, this would be handled by a secure server function
      // For the demo, we'll show an info message since we can't use the service role key
      toast.info("In a production app, this would send an invitation email to the user");
      
      setIsInviteDialogOpen(false);
      clearForm();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(`Error inviting user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearForm = () => {
    setEmail("");
    setName("");
    setRole("cashier");
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              Invite New User
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">Admin User</h3>
                  <p className="text-sm text-muted-foreground">admin@example.com</p>
                </div>
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  Administrator
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">Manager User</h3>
                  <p className="text-sm text-muted-foreground">manager@example.com</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Manager
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">Cashier User</h3>
                  <p className="text-sm text-muted-foreground">cashier@example.com</p>
                </div>
                <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  Cashier
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="pointer-events-auto">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user to join the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="pointer-events-auto">
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersSettings;
