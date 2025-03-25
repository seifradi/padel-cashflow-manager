
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChangeEvent, useState } from "react";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const AmountInput = ({
  value,
  onChange,
  currency = "TNd",
  min,
  max,
  className,
  placeholder = "0.00",
  disabled = false,
}: AmountInputProps) => {
  const [displayValue, setDisplayValue] = useState(value ? value.toString() : "");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty or numeric values with optional single decimal point
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setDisplayValue(inputValue);
      
      // Convert to number for the onChange handler (or 0 if empty)
      const numericValue = inputValue === "" ? 0 : parseFloat(inputValue);
      
      // Only call onChange if it's a valid number
      if (!isNaN(numericValue)) {
        // Check min/max constraints
        let constrainedValue = numericValue;
        if (min !== undefined && constrainedValue < min) constrainedValue = min;
        if (max !== undefined && constrainedValue > max) constrainedValue = max;
        
        onChange(constrainedValue);
      }
    }
  };

  // Format for display when input loses focus
  const handleBlur = () => {
    if (displayValue === "") {
      setDisplayValue("");
      onChange(0);
    } else {
      const numericValue = parseFloat(displayValue);
      if (!isNaN(numericValue)) {
        // Format to 2 decimal places
        setDisplayValue(numericValue.toFixed(2));
      }
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn("pl-10", className)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {currency}
      </div>
    </div>
  );
};

export default AmountInput;
