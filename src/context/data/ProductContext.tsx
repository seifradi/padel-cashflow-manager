import { Product, ProductCategory } from "@/lib/types";
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ProductContextType {
  products: Product[];
  updateProduct: (product: Product) => Promise<void>;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustStock: (productId: string, quantity: number, isAddition: boolean) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch products when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    }
  }, [isAuthenticated]);

  const refreshProducts = useCallback(async (): Promise<void> => {
    // Prevent concurrent refreshes
    if (isRefreshing) {
      console.log('Already refreshing products, skipping this call');
      return;
    }
    
    setIsRefreshing(true);
    console.log('Starting product refresh');
    
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
      console.log('Products refreshed successfully:', typedProducts.length);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, toast]);

  const updateProduct = async (updatedProduct: Product): Promise<void> => {
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
      
      // Our triggers will automatically update the product_inventory table
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          category: product.category,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          min_stock: product.minStock
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category as ProductCategory,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        minStock: data.min_stock || undefined
      };

      setProducts([...products, newProduct]);
      
      // Our trigger will automatically create the product_inventory record
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== productId));
      
      // The CASCADE constraint will automatically delete the product_inventory record
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const adjustStock = useCallback(async (productId: string, quantity: number, isAddition: boolean): Promise<void> => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");
      
      const newStock = isAddition 
        ? product.stock + quantity 
        : Math.max(0, product.stock - quantity);
      
      await updateProduct({
        ...product,
        stock: newStock
      });
      
      const message = isAddition 
        ? `Added ${quantity} items to ${product.name}`
        : `Removed ${quantity} items from ${product.name}`;
      
      toast({
        title: "Stock updated",
        description: message,
      });
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error adjusting stock",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [products, toast]);

  return (
    <ProductContext.Provider value={{ 
      products, 
      updateProduct, 
      refreshProducts,
      addProduct,
      deleteProduct,
      adjustStock
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
