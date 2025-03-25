
import { Product, ProductCategory } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/constants";
import { ReactNode, createContext, useContext, useState } from "react";

interface ProductContextType {
  products: Product[];
  updateProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  // Properly cast the product categories
  const typedProducts: Product[] = MOCK_PRODUCTS.map(product => ({
    ...product,
    category: product.category as ProductCategory
  }));
  
  const [products, setProducts] = useState<Product[]>(typedProducts);

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  return (
    <ProductContext.Provider value={{ products, updateProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
