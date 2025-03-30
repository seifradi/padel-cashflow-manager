
import { Sale, ProductCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches all sales with their items from the database
 */
export const fetchSales = async (): Promise<Sale[]> => {
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (salesError) throw salesError;
  
  const salesWithItems: Sale[] = [];
  
  for (const sale of salesData) {
    // Get all items for this sale
    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', sale.id);
    
    if (itemsError) {
      console.error('Error fetching sale items:', itemsError);
      continue;
    }
    
    const saleProducts = itemsData.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));
    
    salesWithItems.push({
      id: sale.id,
      products: saleProducts,
      totalAmount: sale.total_amount,
      paymentMethod: sale.payment_method as any,
      createdBy: sale.created_by,
      createdAt: new Date(sale.created_at),
      notes: sale.notes
    });
  }
  
  return salesWithItems;
};

/**
 * Gets the most up-to-date product data directly from the database
 */
export const getProductFromDB = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      category: data.category as ProductCategory,
      price: data.price,
      cost: data.cost,
      stock: data.stock,
      minStock: data.min_stock || undefined
    };
  } catch (error) {
    console.error('Error fetching product from database:', error);
    return null;
  }
};

/**
 * Creates a new sale in the database
 */
export const createSale = async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
  // Create the sale in the database
  const { data: newSaleData, error: saleError } = await supabase
    .from('sales')
    .insert({
      payment_method: sale.paymentMethod,
      total_amount: sale.totalAmount,
      notes: sale.notes,
      created_by: sale.createdBy
    })
    .select('*')
    .single();

  if (saleError) throw saleError;

  // Then insert sale items and update product stock
  for (const item of sale.products) {
    // Get the latest product data directly from the database
    const productFromDB = await getProductFromDB(item.productId);
    
    if (!productFromDB) {
      console.error(`Product not found: ${item.productId}`);
      continue;
    }

    // Insert sale item
    const { error: itemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: newSaleData.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      });

    if (itemError) {
      console.error('Error inserting sale item:', itemError);
      continue;
    }

    // Calculate new stock level
    const newStock = productFromDB.stock - item.quantity;
    console.log(`Updating stock for ${productFromDB.name}: ${productFromDB.stock} -> ${newStock}`);
    
    // Update product stock in the database - CRITICAL PART FOR STOCK UPDATE
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.productId);
    
    if (updateError) {
      console.error('Error updating product stock:', updateError);
      throw updateError;
    }
  }

  // Create the complete sale object for our state
  const newSale: Sale = {
    id: newSaleData.id,
    products: sale.products,
    totalAmount: sale.totalAmount,
    paymentMethod: sale.paymentMethod,
    createdBy: sale.createdBy,
    createdAt: new Date(newSaleData.created_at),
    notes: sale.notes,
  };

  return newSale;
};
