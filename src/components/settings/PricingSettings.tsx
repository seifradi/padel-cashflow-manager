
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AmountInput from "@/components/common/AmountInput";
import { COURT_DEFAULT_PRICE, PADEL_RENTAL_PRICE, PLAYER_DEFAULT_SHARE } from "@/lib/constants";

const PricingSettings = () => {
  const [courtPrice, setCourtPrice] = useState(COURT_DEFAULT_PRICE);
  const [padelRentalPrice, setPadelRentalPrice] = useState(PADEL_RENTAL_PRICE);
  const [defaultPlayerShare, setDefaultPlayerShare] = useState(PLAYER_DEFAULT_SHARE);
  const [isLoading, setIsLoading] = useState(false);

  const handleSavePricing = () => {
    setIsLoading(true);
    
    // In a real application, we would save these values to a database
    // and then update our constants or app state
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Pricing settings updated successfully");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="court-price">Default Court Price (per session)</Label>
            <div className="flex items-center space-x-2">
              <AmountInput
                value={courtPrice}
                onChange={setCourtPrice}
                min={0}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">TNd</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="padel-rental">Padel Rental Price</Label>
            <div className="flex items-center space-x-2">
              <AmountInput
                value={padelRentalPrice}
                onChange={setPadelRentalPrice}
                min={0}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">TNd</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-share">Default Player Share</Label>
            <div className="flex items-center space-x-2">
              <AmountInput
                value={defaultPlayerShare}
                onChange={setDefaultPlayerShare}
                min={0}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">TNd</span>
            </div>
          </div>
          
          <Button onClick={handleSavePricing} className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Pricing Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingSettings;
