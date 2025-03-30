
import { useState } from "react";
import { Product } from "@/lib/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Edit, Package, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (productId: string) => void;
  onStockAdjust: (productId: string) => void;
  onDelete: (productId: string) => void;
}

type SortField = "name" | "category" | "price" | "stock";
type SortDirection = "asc" | "desc";

const ProductTable = ({ 
  products, 
  onView,
  onEdit,
  onStockAdjust,
  onDelete
}: ProductTableProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const sortedProducts = [...products].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });
  
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No products found matching your criteria
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] cursor-pointer" onClick={() => toggleSort("name")}>
              Name
              {sortField === "name" && (
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("category")}>
              Category
              {sortField === "category" && (
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("price")}>
              Price
              {sortField === "price" && (
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("stock")}>
              Stock
              {sortField === "stock" && (
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{product.price} TNd</TableCell>
              <TableCell className="text-right">
                {product.stock === 0 ? (
                  <StatusBadge status="error">Out of Stock</StatusBadge>
                ) : product.minStock && product.stock <= product.minStock ? (
                  <StatusBadge status="warning">Low ({product.stock})</StatusBadge>
                ) : (
                  product.stock
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(product);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStockAdjust(product.id);
                    }}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(product.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
