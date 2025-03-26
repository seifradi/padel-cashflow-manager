
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, FileUp } from "lucide-react";

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onAddProduct: () => void;
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
}

const InventoryFilters = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onAddProduct,
  stockFilter,
  onStockFilterChange,
  onExportCSV,
  onImportCSV
}: InventoryFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:w-72"
      />
      
      <Select
        value={categoryFilter}
        onValueChange={onCategoryFilterChange}
      >
        <SelectTrigger className="md:w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="pointer-events-auto">
          <SelectItem value="all">All Categories</SelectItem>
          {PRODUCT_CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={stockFilter}
        onValueChange={onStockFilterChange}
      >
        <SelectTrigger className="md:w-40">
          <SelectValue placeholder="Stock Status" />
        </SelectTrigger>
        <SelectContent className="pointer-events-auto">
          <SelectItem value="all">All Stock</SelectItem>
          <SelectItem value="low">Low Stock</SelectItem>
          <SelectItem value="out">Out of Stock</SelectItem>
          <SelectItem value="in">In Stock</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex-1"></div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onExportCSV} title="Export to CSV">
          <FileDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onImportCSV} title="Import from CSV">
          <FileUp className="h-4 w-4" />
        </Button>
        <Button onClick={onAddProduct} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default InventoryFilters;
