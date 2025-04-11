
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
  const [refreshRequestQueue, setRefreshRequestQueue] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    }
  }, [isAuthenticated]);

  // Additional effect to handle queued refresh requests
  useEffect(() => {
    if (refreshRequestQueue > 0 && !isRefreshing) {
      setRefreshRequestQueue(0);
      refreshProducts();
    }
  }, [refreshRequestQueue, isRefreshing]);

  const refreshProducts = useCallback(async (): Promise<void> => {
    if (isRefreshing) {
      console.log('Already refreshing products, queuing another refresh');
      setRefreshRequestQueue(prev => prev + 1);
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
      console.log(`Adjusting stock for product ${productId}: ${isAddition ? '+' : '-'}${quantity}`);
      
      // Call our custom RPC function to adjust the stock in both tables
      const { error } = await supabase.rpc(
        'adjust_product_stock',
        {
          product_id_param: productId,
          quantity_param: quantity,
          is_addition: isAddition
        }
      );
        
      if (error) throw error;
      
      console.log('Stock adjustment completed in database, refreshing product data');
      
      // Refresh the products after the stock adjustment
      await refreshProducts();
      
      // Get the product name for the toast message
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");
      
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
  }, [products, refreshProducts, toast]);

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
