
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

const ProductList = ({ products, onSelect }: ProductListProps) => {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No products found matching your criteria
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onSelect(product)}
        />
      ))}
    </div>
  );
};

export default ProductList;
