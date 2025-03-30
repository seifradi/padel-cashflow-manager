
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/common/StatusBadge";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import {
  ArrowLeft,
  Package,
  Edit,
  Package as PackageIcon,
  Trash2
} from "lucide-react";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
  onStockAdjust: () => void;
  onDelete: () => void;
}

const ProductDetails = ({
  product,
  onBack,
  onEdit,
  onStockAdjust,
  onDelete
}: ProductDetailsProps) => {
  const categoryName = PRODUCT_CATEGORIES.find((c) => c.id === product.category)?.name || product.category;
  
  const profit = product.price - product.cost;
  const profitMargin = product.cost > 0 ? (profit / product.cost) * 100 : 0;
  
  const stockStatus = product.stock === 0 
    ? "error" 
    : (product.minStock && product.stock <= product.minStock) 
      ? "warning" 
      : "success";
  
  const stockText = product.stock === 0 
    ? "Out of Stock" 
    : (product.minStock && product.stock <= product.minStock) 
      ? `Low Stock (${product.stock})` 
      : `${product.stock} units`;

  return (
    <div className="bg-background border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">{product.name}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="capitalize">
              {categoryName}
            </Badge>
            <div className="text-xs text-muted-foreground">
              ID: {product.id.slice(0, 8)}...
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Selling Price</div>
                  <div className="text-lg font-medium">{product.price.toFixed(2)} TNd</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Cost Price</div>
                  <div className="text-lg font-medium">{product.cost.toFixed(2)} TNd</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Profit</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Profit per Unit</div>
                  <div className="text-lg font-medium">{profit.toFixed(2)} TNd</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                  <div className="text-lg font-medium">{profitMargin.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock Information</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={stockStatus}>{stockText}</StatusBadge>
              {product.minStock && (
                <span className="text-sm text-muted-foreground">
                  (Alert threshold: {product.minStock} units)
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-lg font-medium">
              {(product.stock * product.price).toFixed(2)} TNd
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" /> Edit Product
            </Button>
            <Button onClick={onStockAdjust} variant="secondary" className="gap-2">
              <PackageIcon className="h-4 w-4" /> Adjust Stock
            </Button>
            <Button onClick={onDelete} variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
