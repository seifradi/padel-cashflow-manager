
import { Product, ProductCategory } from "@/lib/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  updateProduct: (product: Product) => Promise<void>;
  refreshProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, quantity: number, isAddition: boolean) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch products when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    }
  }, [isAuthenticated]);

  const refreshProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
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
      
      console.log(`Loaded ${typedProducts.length} products from database`);
      setProducts(typedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const addProduct = async (productData: Omit<Product, "id">): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          price: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          min_stock: productData.minStock
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
      
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      toast({
        title: "Product added",
        description: `${newProduct.name} has been added successfully`,
      });
      
      return newProduct;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

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

      // After successful database update, update the local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

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
  
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state after successful database deletion
      setProducts(products.filter(product => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const adjustStock = async (productId: string, quantity: number, isAddition: boolean): Promise<void> => {
    try {
      // Get the product
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");
      
      // Calculate new stock
      const newStock = isAddition 
        ? product.stock + quantity 
        : Math.max(0, product.stock - quantity);
      
      // Update in database first
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
        
      if (error) throw error;
      
      // Then update local state
      const updatedProduct = { ...product, stock: newStock };
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === productId ? updatedProduct : p)
      );
      
      toast({
        title: "Stock updated",
        description: `${product.name} stock ${isAddition ? 'increased' : 'decreased'} by ${quantity}`,
      });
      
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error adjusting stock",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      isLoading,
      updateProduct,
      refreshProducts,
      getProduct,
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
