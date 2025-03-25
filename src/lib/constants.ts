
export const COURT_DEFAULT_PRICE = 80; // TNd for 1.5 hours
export const PLAYER_DEFAULT_SHARE = 20; // TNd per player
export const PADEL_RENTAL_PRICE = 5; // TNd per person

export const BOOKING_TYPES = [
  { id: 'regular', name: 'Regular Session' },
  { id: 'tournament', name: 'Tournament' },
  { id: 'coaching', name: 'Coaching Session' },
  { id: 'americano', name: 'Americano Event' },
];

export const BOOKING_STATUSES = [
  { id: 'pending', name: 'Pending' },
  { id: 'confirmed', name: 'Confirmed' },
  { id: 'cancelled', name: 'Cancelled' },
  { id: 'completed', name: 'Completed' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash' },
  { id: 'card', name: 'Card' },
  { id: 'transfer', name: 'Bank Transfer' },
];

export const PRODUCT_CATEGORIES = [
  { id: 'drink', name: 'Drinks' },
  { id: 'food', name: 'Food' },
  { id: 'equipment', name: 'Equipment' },
  { id: 'service', name: 'Services' },
  { id: 'other', name: 'Other' },
];

export const TIME_SLOTS = [
  '08:00', '09:30', '11:00', '12:30', '14:00', 
  '15:30', '17:00', '18:30', '20:00', '21:30'
];

// Mock data for development
export const MOCK_COURTS = [
  { id: 'court-1', name: 'Court 1', isAvailable: true },
  { id: 'court-2', name: 'Court 2', isAvailable: true },
  { id: 'court-3', name: 'Court 3', isAvailable: true },
  { id: 'court-4', name: 'Court 4', isAvailable: true },
];

export const MOCK_PLAYERS = [
  { id: 'player-1', name: 'Ahmed Ben Salem', phone: '55123456' },
  { id: 'player-2', name: 'Sarra Mansour', phone: '22987654', specialPrice: 15 },
  { id: 'player-3', name: 'Karim Trabelsi', phone: '98456789' },
  { id: 'player-4', name: 'Nadia Slim', phone: '27654321' },
  { id: 'player-5', name: 'Youssef Khelil', phone: '50789123', specialPrice: 0 },
];

export const MOCK_PRODUCTS = [
  { id: 'product-1', name: 'Water (Small)', category: 'drink', price: 2, cost: 1, stock: 48 },
  { id: 'product-2', name: 'Water (Large)', category: 'drink', price: 3, cost: 1.5, stock: 36 },
  { id: 'product-3', name: 'Coke', category: 'drink', price: 4, cost: 2, stock: 24 },
  { id: 'product-4', name: 'Energy Drink', category: 'drink', price: 6, cost: 3, stock: 12 },
  { id: 'product-5', name: 'Snack Bar', category: 'food', price: 3, cost: 1.5, stock: 20 },
  { id: 'product-6', name: 'Padel Racket (Rental)', category: 'equipment', price: 5, cost: 0, stock: 8 },
  { id: 'product-7', name: 'Padel Balls (3 pack)', category: 'equipment', price: 12, cost: 8, stock: 15 },
];

export const EXPENSE_CATEGORIES = [
  'Utilities', 
  'Maintenance', 
  'Supplies', 
  'Staff', 
  'Marketing', 
  'Other'
];

export const USER_ROLES = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'cashier', name: 'Cashier' },
];

// Mock current user for development
export const MOCK_CURRENT_USER = {
  id: 'user-1',
  name: 'Admin User',
  role: 'admin' as const,
  avatar: '',
};
