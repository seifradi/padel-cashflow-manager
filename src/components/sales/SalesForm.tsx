
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { PAYMENT_METHODS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { ProductCategory } from "@/lib/types";
import { Minus, Plus, ShoppingCart, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Card from "../common/Card";
import AmountInput from "../common/AmountInput";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

const SalesForm = () => {
  const { products, addSale, refreshProducts } = useData();
  const { user } = useAuth();
  const { translations } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refresh products when component mounts to ensure latest stock
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);
  
  // Filter products by category
  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory);
  
  // Add product to cart
  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Check if item already exists in cart
    const existingCartItem = cart.find(item => item.productId === productId);
    
    if (existingCartItem) {
      // Increment quantity if product already in cart
      increaseQuantity(productId);
    } else {
      // Add new item to cart
      setCart([
        ...cart,
        {
          productId,
          quantity: 1,
          price: product.price,
          name: product.name,
        },
      ]);
    }
    
    toast.success(`Added ${product.name} to cart`);
  };
  
  // Increase cart item quantity
  const increaseQuantity = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setCart(
      cart.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + 1;
          
          // Check if we have enough stock
          if (newQuantity > product.stock) {
            toast.error(`Not enough stock for ${product.name}`);
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  // Decrease cart item quantity
  const decreaseQuantity = (productId: string) => {
    setCart(
      cart.map(item => {
        if (item.productId === productId) {
          const newQuantity = Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };
  
  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Handle refresh products
  const handleRefreshProducts = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      toast.success(translations.productsRefreshed || "Products refreshed successfully");
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error(translations.errorRefreshingProducts || "Error refreshing products");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(translations.cartEmpty || "Cart is empty");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const sale = {
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        paymentMethod: paymentMethod as any,
        createdBy: user?.id || "",
        createdAt: new Date(),
        notes: notes,
      };
      
      await addSale(sale);
      
      toast.success(translations.saleCompleted || "Sale completed successfully");
      
      // Reset form
      setCart([]);
      setNotes("");
      
      // Refresh products to get updated stock values
      await refreshProducts();
    } catch (error) {
      toast.error(translations.failedToCompleteSale || "Failed to complete sale");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card title={translations.products || "Products"} contentClassName="p-0" noPadding>
          <div className="p-4 border-b flex justify-between items-center">
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as any)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={translations.allCategories || "All Categories"} />
              </SelectTrigger>
              <SelectContent className="pointer-events-auto">
                <SelectItem value="all">{translations.allCategories || "All Categories"}</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {translations[category.id as keyof typeof translations] || category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshProducts}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{translations.refresh || "Refresh"}</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-md p-3 flex justify-between items-center transition-all-fast hover:border-primary/50 hover:bg-primary/5"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.price} TNd · {translations.stock || "Stock"}: {product.stock}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                {translations.noProductsAvailable || "No products available in this category"}
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div>
        <Card title={translations.shoppingCart || "Shopping Cart"} subtitle={translations.currentItemsInCart || "Current items in cart"}>
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                <ShoppingCart className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>{translations.yourCartIsEmpty || "Your cart is empty"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="border rounded-md p-3">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.name}</div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">
                        {item.price} TNd × {item.quantity} = {(item.price * item.quantity).toFixed(2)} TNd
                      </div>
                      
                      <div className="flex items-center">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 rounded-full"
                          onClick={() => decreaseQuantity(item.productId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 w-6 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 rounded-full"
                          onClick={() => increaseQuantity(item.productId)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t space-y-4">
              <div>
                <label className="text-sm font-medium">{translations.paymentMethod || "Payment Method"}</label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={translations.selectPaymentMethod || "Select payment method"} />
                  </SelectTrigger>
                  <SelectContent className="pointer-events-auto">
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {translations[method.id as keyof typeof translations] || method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">{translations.notes || "Notes"}</label>
                <Textarea
                  placeholder={translations.addNotesAboutSale || "Add any notes about this sale"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">{translations.total || "Total"}:</span>
                  <span className="text-lg font-bold">{calculateTotal().toFixed(2)} TNd</span>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isProcessing}
                >
                  {isProcessing ? (translations.processing || "Processing...") : (translations.completeSale || "Complete Sale")}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesForm;
