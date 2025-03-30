
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
import { PAYMENT_METHODS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { ProductCategory } from "@/lib/types";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refresh products when component mounts to ensure we have the latest stock data
  useEffect(() => {
    refreshProducts();
  }, []);
  
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
  
  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    // Verify stock availability again before completing sale
    const stockIssues = [];
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > product.stock) {
        stockIssues.push(`Not enough stock for ${item.name}: ${product.stock} available`);
      }
    }
    
    if (stockIssues.length > 0) {
      stockIssues.forEach(issue => toast.error(issue));
      return;
    }
    
    try {
      setIsSubmitting(true);
      
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
      
      console.log("Processing sale:", sale);
      await addSale(sale);
      
      // After successful sale, refresh products to get updated stock values
      await refreshProducts();
      
      // Reset form
      setCart([]);
      setNotes("");
      toast.success("Sale completed successfully");
      
    } catch (error: any) {
      console.error("Failed to complete sale:", error);
      toast.error(error.message || "Failed to complete sale");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card title="Products" contentClassName="p-0" noPadding>
          <div className="p-4 border-b">
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as any)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="pointer-events-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                      {product.price} TNd · Stock: {product.stock}
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
                No products available in this category
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div>
        <Card title="Shopping Cart" subtitle="Current items in cart">
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                <ShoppingCart className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>Your cart is empty</p>
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
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="pointer-events-auto">
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add any notes about this sale"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">{calculateTotal().toFixed(2)} TNd</span>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Complete Sale"}
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
