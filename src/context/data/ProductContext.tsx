
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
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
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
      return typedProducts;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
      throw error;
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
      
      setProducts([...products, newProduct]);
      
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

  const updateProduct = async (updatedProduct: Product) => {
    try {
      console.log("Updating product in database:", updatedProduct);
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

      // Update local state after successful database update
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
  
  const deleteProduct = async (id: string) => {
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

  return (
    <ProductContext.Provider value={{ 
      products, 
      updateProduct,
      refreshProducts,
      getProduct,
      addProduct,
      deleteProduct
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
