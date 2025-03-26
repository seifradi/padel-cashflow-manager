
import { useState } from "react";
import { useData } from "@/context/data";
import { Court } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
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

const CourtsSettings = () => {
  const { courts, refreshCourts } = useData();
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [editedName, setEditedName] = useState("");
  const [deletingCourt, setDeletingCourt] = useState<Court | null>(null);

  const handleAddCourt = async () => {
    if (!newCourtName.trim()) {
      toast.error("Court name cannot be empty");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("courts")
        .insert({ name: newCourtName.trim() })
        .select()
        .single();

      if (error) throw error;

      toast.success("Court added successfully");
      setNewCourtName("");
      setIsAddingCourt(false);
      refreshCourts();
    } catch (error: any) {
      toast.error("Error adding court: " + error.message);
    }
  };

  const handleUpdateCourt = async () => {
    if (!editingCourt) return;
    if (!editedName.trim()) {
      toast.error("Court name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("courts")
        .update({ name: editedName.trim() })
        .eq("id", editingCourt.id);

      if (error) throw error;

      toast.success("Court updated successfully");
      setEditingCourt(null);
      refreshCourts();
    } catch (error: any) {
      toast.error("Error updating court: " + error.message);
    }
  };

  const handleDeleteCourt = async () => {
    if (!deletingCourt) return;

    try {
      const { error } = await supabase
        .from("courts")
        .delete()
        .eq("id", deletingCourt.id);

      if (error) throw error;

      toast.success("Court deleted successfully");
      setDeletingCourt(null);
      refreshCourts();
    } catch (error: any) {
      toast.error("Error deleting court: " + error.message);
    }
  };

  const handleToggleAvailability = async (court: Court) => {
    try {
      const { error } = await supabase
        .from("courts")
        .update({ is_available: !court.isAvailable })
        .eq("id", court.id);

      if (error) throw error;

      toast.success(`Court ${court.name} is now ${!court.isAvailable ? "available" : "unavailable"}`);
      refreshCourts();
    } catch (error: any) {
      toast.error("Error updating court availability: " + error.message);
    }
  };

  const startEditing = (court: Court) => {
    setEditingCourt(court);
    setEditedName(court.name);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Court Management</h2>
        <Button onClick={() => setIsAddingCourt(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Court
        </Button>
      </div>

      {isAddingCourt && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">Add New Court</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Court name"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddCourt}>Add</Button>
            <Button variant="outline" onClick={() => setIsAddingCourt(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {courts.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No courts found. Add a court to get started.
          </p>
        ) : (
          courts.map((court) => (
            <div
              key={court.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              {editingCourt?.id === court.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    autoFocus
                  />
                  <Button size="icon" onClick={handleUpdateCourt}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditingCourt(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span
                      className={
                        court.isAvailable ? "font-medium" : "text-muted-foreground"
                      }
                    >
                      {court.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <span className="text-sm">Available</span>
                      <Switch
                        checked={court.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(court)}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditing(court)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletingCourt(court)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!deletingCourt} onOpenChange={() => setDeletingCourt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the court "{deletingCourt?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourt}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CourtsSettings;
