
export type User = {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  avatar?: string;
};

export type Player = {
  id: string;
  name: string;
  phone?: string;
  specialPrice?: number;
  notes?: string;
};

export type Court = {
  id: string;
  name: string;
  isAvailable: boolean;
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type BookingType = 'regular' | 'tournament' | 'coaching' | 'americano';

export type Booking = {
  id: string;
  courtId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  type: BookingType;
  courtPrice: number;
  players: {
    playerId: string;
    playerShare: number;
    padelRental: boolean;
  }[];
  createdBy: string;
  createdAt: Date;
  notes?: string;
  totalAmount: number;
};

export type ProductCategory = 'drink' | 'food' | 'equipment' | 'service' | 'other';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock?: number;
};

export type Sale = {
  id: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  createdBy: string;
  createdAt: Date;
  notes?: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdBy: string;
  createdAt: Date;
  receipt?: string;
};

export type DailyBalance = {
  id: string;
  date: Date;
  startingAmount: number;
  cashInRegister: number;
  calculatedAmount: number;
  difference: number;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  closedBy: string;
  closedAt: Date;
};

export type ReportTimeframe = 'daily' | 'weekly' | 'monthly' | 'custom';

export type StatsSummary = {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
};
