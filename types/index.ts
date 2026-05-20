export interface Cottage {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  size: number | null;
  amenities: string[];
  images: string[];
  isActive: boolean;
  sortOrder: number;
  seasonalPricings?: SeasonalPricing[];
}

export interface SeasonalPricing {
  id: string;
  cottageId: string;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  minStay: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingRef: string;
  guestId: string;
  cottageId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  discount: number;
  couponCode: string | null;
  finalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  specialRequests: string | null;
  source: string;
  createdAt: string;
  cottage: Cottage;
  guest: Guest;
  payment: Payment | null;
}

export type BookingStatus = 'PENDING' | 'RESERVED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  orderId: string | null;
  paymentId: string | null;
  amount: number;
  status: PaymentStatus;
  gateway: string;
}

export interface CafeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  items: CafeItem[];
}

export interface CafeItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  sortOrder: number;
}

export interface CafeOrder {
  id: string;
  orderRef: string;
  tableNumber: number;
  guestName: string | null;
  status: string;
  totalAmount: number;
  items: CafeOrderItem[];
  createdAt: string;
}

export interface CafeOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  item: CafeItem;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  image: string | null;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
}

export interface GalleryItem {
  id: string;
  image: string;
  caption: string | null;
  category: string | null;
  sortOrder: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
}

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'CAFE_STAFF';

export interface DashboardStats {
  totalBookings: number;
  monthlyBookings: number;
  yearlyRevenue: number;
  totalCottages: number;
  activeCottages: number;
  pendingBookings: number;
  totalCafeOrders: number;
  todayCafeOrders: number;
  unreadMessages: number;
  totalGuests: number;
}

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: { platform: string; url: string }[];
  [key: string]: any;
}
