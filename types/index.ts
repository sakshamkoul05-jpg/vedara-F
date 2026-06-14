export interface Cottage {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  category?: string;
  pricePerNight: number;
  heaterCharge: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  amenities: string[] | string;
  images: string[] | string;
  isActive?: boolean;
  sortOrder?: number;
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

export interface CMSContent {
  homepage: {
    heroTitle: string
    heroSubtitle: string
    heroImage: string
    introText: string
    features: { title: string; description: string; icon: string }[]
  }
  about: {
    title: string
    content: string
    images: string[]
    mission: string
    vision: string
  }
  policies: {
    cancellation: string
    checkIn: string
    checkOut: string
    houseRules: string
    petPolicy: string
    smokingPolicy: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: string
    keywords: string[]
  }
}

export interface Coupon {
  id: string
  code: string
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  minAmount: number
  maxUses: number
  usedCount: number
  maxUsesPerUser: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export interface DashboardRevenue {
  period: string
  total: number
  bookings: number
  cafe: number
  refunds: number
  net: number
  chartData: { date: string; amount: number }[]
}

export interface DashboardOccupancy {
  overall: number
  totalCottages: number
  bookedCottages: number
  availableCottages: number
  monthlyData: { month: string; occupancy: number }[]
  cottageBreakdown: { name: string; occupancy: number; bookings: number }[]
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  price: number
  updatedAt: string
}

export interface StaffTask {
  id: string
  title: string
  description: string | null
  assignedTo: string
  assignedToName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  createdAt: string
}

export interface StaffAttendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY'
  notes: string | null
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  employeeId: string;
  role: string;
  salary?: number;
  address?: string;
  photo?: string;
  status: 'ACTIVE' | 'FIRED';
  hiredAt: string;
  firedAt?: string;
  createdAt: string;
}

export interface Package {
  id: string;
  title: string;
  description?: string;
  image?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
}

export interface GuestProfile {
  id: string;
  guestId: string;
  guest?: Guest;
  loyaltyPoints: number;
  totalStays: number;
  totalSpent: number;
  tier: string;
  referralCode: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  profileId: string;
  points: number;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
  description: string | null;
  bookingId: string | null;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string | null;
  referredEmail: string | null;
  code: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  rewardPoints: number;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: string;
  discountPercent: number;
  minNights: number;
  maxNights: number | null;
  startDate: string | null;
  endDate: string | null;
  daysOfWeek: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staff?: Staff;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  status: string;
  notes: string | null;
}

export interface CafeInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number | null;
  costPrice: number;
  supplier: string | null;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  logs?: CafeInventoryLog[];
}

export interface CafeInventoryLog {
  id: string;
  inventoryId: string;
  action: string;
  quantity: number;
  previousQuantity: number;
  reason: string | null;
  performedBy: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  guestId: string;
  guest?: Guest;
  bookingId: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  pros: string | null;
  cons: string | null;
  reply: string | null;
  replyAt: string | null;
  isPublic: boolean;
  source: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  isActive: boolean;
  failCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  deliveries?: WebhookDelivery[];
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: string;
  statusCode: number | null;
  response: string | null;
  duration: number | null;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  fileUrl: string | null;
  expiryDate: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
