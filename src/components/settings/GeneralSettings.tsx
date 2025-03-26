
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const GeneralSettings = () => {
  const [clubName, setClubName] = useState("Padel Club");
  const [clubAddress, setClubAddress] = useState("123 Sports Avenue");
  const [clubPhone, setClubPhone] = useState("+216 71 123 456");
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, this would update the database
    toast.success("General settings saved successfully");
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">General Settings</h2>
        <p className="text-muted-foreground">Configure your club information and general preferences</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="clubName">Club Name</Label>
          <Input
            id="clubName"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Enter club name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clubAddress">Club Address</Label>
          <Input
            id="clubAddress"
            value={clubAddress}
            onChange={(e) => setClubAddress(e.target.value)}
            placeholder="Enter club address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clubPhone">Contact Phone</Label>
          <Input
            id="clubPhone"
            value={clubPhone}
            onChange={(e) => setClubPhone(e.target.value)}
            placeholder="Enter contact phone"
          />
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Preferences</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for new bookings and transactions</p>
            </div>
            <Switch
              id="enableNotifications"
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoPrintReceipt">Auto-Print Receipts</Label>
              <p className="text-sm text-muted-foreground">Automatically print receipts after transactions</p>
            </div>
            <Switch
              id="autoPrintReceipt"
              checked={autoPrintReceipt}
              onCheckedChange={setAutoPrintReceipt}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </div>
    </Card>
  );
};

export default GeneralSettings;
