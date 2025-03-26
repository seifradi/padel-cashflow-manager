
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AmountInput from "@/components/common/AmountInput";
import { toast } from "sonner";
import {
  COURT_DEFAULT_PRICE,
  PADEL_RENTAL_PRICE,
  PLAYER_DEFAULT_SHARE
} from "@/lib/constants";

const PricingSettings = () => {
  const [courtPrice, setCourtPrice] = useState<number>(COURT_DEFAULT_PRICE);
  const [playerShare, setPlayerShare] = useState<number>(PLAYER_DEFAULT_SHARE);
  const [padelRentalPrice, setPadelRentalPrice] = useState<number>(PADEL_RENTAL_PRICE);
  
  // In a real app, these would be fetched from and saved to a database
  // For this demo, we're just updating state and showing a success toast

  const handleSaveSettings = () => {
    // In a real app, this would update the database
    toast.success("Pricing settings saved successfully");
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Pricing Settings</h2>
        <p className="text-muted-foreground">Configure default pricing for bookings and services</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="courtPrice">Default Court Price (TND)</Label>
          <div className="flex gap-4 items-center">
            <AmountInput
              id="courtPrice"
              value={courtPrice}
              onChange={(value) => setCourtPrice(value)}
              min={0}
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">
              This is the default price for booking a court
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="playerShare">Default Player Share (TND)</Label>
          <div className="flex gap-4 items-center">
            <AmountInput
              id="playerShare"
              value={playerShare}
              onChange={(value) => setPlayerShare(value)}
              min={0}
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">
              This is the default amount each player pays when joining a court
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="padelRentalPrice">Padel Rental Price (TND)</Label>
          <div className="flex gap-4 items-center">
            <AmountInput
              id="padelRentalPrice"
              value={padelRentalPrice}
              onChange={(value) => setPadelRentalPrice(value)}
              min={0}
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">
              This is the price for renting padel equipment
            </span>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </div>
    </Card>
  );
};

export default PricingSettings;
