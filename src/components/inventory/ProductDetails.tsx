
import { Product } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "../common/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Edit, 
  PlusCircle, 
  MinusCircle,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ProductDetailsProps {
  product: Product;
  onEdit: () => void;
  onStockAdjust: () => void;
  onDelete: () => void;
}

const ProductDetails = ({ 
  product, 
  onEdit, 
  onStockAdjust, 
  onDelete
}: ProductDetailsProps) => {
  const categoryName = PRODUCT_CATEGORIES.find(cat => cat.id === product.category)?.name || product.category;
  const profit = product.price - product.cost;
  const profitMargin = product.cost > 0 ? (profit / product.cost) * 100 : 0;
  
  const stockStatus = product.stock === 0 
    ? 'error' 
    : (product.minStock && product.stock <= product.minStock) 
      ? 'warning' 
      : 'success';
  
  const stockText = product.stock === 0 
    ? 'Out of Stock' 
    : (product.minStock && product.stock <= product.minStock) 
      ? `Low Stock (${product.stock})` 
      : `${product.stock} units`;
  
  return (
    <Card className="animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {categoryName}
              </Badge>
              {product.name}
            </CardTitle>
            <CardDescription>Product ID: {product.id.slice(0, 8)}</CardDescription>
          </div>
          <Package size={24} className="text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Selling Price</h4>
              <p className="text-lg font-semibold">{product.price.toFixed(2)} TNd</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Cost Price</h4>
              <p className="text-lg font-semibold">{product.cost.toFixed(2)} TNd</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Profit</h4>
              <p className="text-lg font-semibold">{profit.toFixed(2)} TNd</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Profit Margin</h4>
              <p className="text-lg font-semibold">{profitMargin.toFixed(1)}%</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Stock Information</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <StatusBadge status={stockStatus}>{stockText}</StatusBadge>
                </p>
                {product.minStock && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Low stock alert: {product.minStock} units
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Value: {(product.stock * product.price).toFixed(2)} TNd
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-4">
            <Button onClick={onEdit} variant="outline" className="gap-1">
              <Edit size={16} /> Edit
            </Button>
            <Button onClick={onStockAdjust} variant="outline" className="gap-1">
              <PlusCircle size={16} /> Stock
            </Button>
            <Button onClick={onDelete} variant="outline" className="text-destructive gap-1 hover:bg-destructive/10">
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;
