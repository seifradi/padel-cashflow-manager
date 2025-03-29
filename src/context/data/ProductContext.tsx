
import { Product, ProductCategory } from "@/lib/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ProductContextType {
  products: Product[];
  updateProduct: (product: Product) => Promise<void>;
  refreshProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch products when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    }
  }, [isAuthenticated]);

  const refreshProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Convert Supabase data to our app's Product type
      const typedProducts: Product[] = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category as ProductCategory,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.min_stock || undefined
      }));
      
      setProducts(typedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          category: updatedProduct.category,
          price: updatedProduct.price,
          cost: updatedProduct.cost,
          stock: updatedProduct.stock,
          min_stock: updatedProduct.minStock
        })
        .eq('id', updatedProduct.id);

      if (error) throw error;

      setProducts(products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ));
      
      // Notify success
      toast({
        title: "Product updated",
        description: `${updatedProduct.name} has been updated successfully`,
      });
      
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      updateProduct, 
      refreshProducts,
      getProduct 
    }}>
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
