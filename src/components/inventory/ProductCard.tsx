
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/common/StatusBadge";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const stockStatus = product.stock === 0 
    ? "error"
    : (product.minStock && product.stock <= product.minStock) 
      ? "warning" 
      : "success";

  const stockLabel = product.stock === 0 
    ? "Out of Stock"
    : (product.minStock && product.stock <= product.minStock) 
      ? `Low Stock (${product.stock})` 
      : `${product.stock} units`;

  return (
    <div
      className="border rounded-lg p-4 transition-colors hover:border-primary/30 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium truncate">{product.name}</h3>
          <Badge variant="outline" className="mt-1 capitalize">
            {product.category}
          </Badge>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-medium">{product.price} TNd</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cost:</span>
          <span className="font-medium">{product.cost} TNd</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Stock:</span>
          <StatusBadge status={stockStatus}>{stockLabel}</StatusBadge>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
