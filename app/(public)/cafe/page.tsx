'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Coffee, Soup, Fish, Salad, UtensilsCrossed, IceCream, CupSoda, Sparkles, Mountain, ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2, Send, Store, Home, CheckCircle, Moon, Flame } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { endpoints } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { OrderReceipt, type ReceiptData, type ReceiptItem } from '@/components/cafe/OrderReceipt';

type CafeItemT = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  sortOrder: number;
};

type CafeCategoryT = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  items: CafeItemT[];
};

/**
 * Presentation for each menu category: the tab icon and the little chip
 * above the grid. Names, prices and availability come from the café menu
 * in the database, so the guest always sees exactly what will be billed.
 */
const CATEGORY_STYLES: Record<string, { icon: any; subtitle: string }> = {
  'mountain-breakfast': { icon: Coffee, subtitle: '7:30 AM - 10:00 AM' },
  'himachali-specials': { icon: Mountain, subtitle: 'From the Himachali kitchen' },
  'vedara-thali': { icon: UtensilsCrossed, subtitle: 'Complete mountain meals' },
  'mountain-curries': { icon: Salad, subtitle: 'Slow-cooked curries' },
  'wood-fired-grills': { icon: Flame, subtitle: 'From the fire' },
  'alpine-pasta': { icon: UtensilsCrossed, subtitle: 'Mountain-style pasta' },
  'asian-wok': { icon: Fish, subtitle: 'Wok-tossed favourites' },
  'soups-starters': { icon: Soup, subtitle: 'Warm bowls & starters' },
  'salads-sides': { icon: Salad, subtitle: 'Light & fresh sides' },
  'desserts': { icon: IceCream, subtitle: 'Sweet endings' },
  'beverages': { icon: CupSoda, subtitle: 'Hot & cold drinks' },
};

const DEFAULT_CATEGORY_STYLE = { icon: Coffee, subtitle: 'The Perch' };
const styleFor = (cat?: { slug: string } | null) =>
  (cat && CATEGORY_STYLES[cat.slug]) || DEFAULT_CATEGORY_STYLE;

/** Postgres `timestamp without time zone` arrives without a zone — it is UTC. */
function normaliseDbDate(value?: string | null): string {
  const raw = (value || '').trim();
  if (!raw) return new Date().toISOString();
  if (/Z|[+-]\d{2}:?\d{2}$/.test(raw)) return raw;
  return raw.replace(' ', 'T') + 'Z';
}



function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CafePage() {
  const [categories, setCategories] = useState<CafeCategoryT[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'table' | 'cottage'>('table');
  const [tableCottageInput, setTableCottageInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<ReceiptData | null>(null);

  const toggleFlip = (localId: string) => {
    setFlippedIds(prev => ({ ...prev, [localId]: !prev[localId] }));
  };

  const showNotification = (itemName: string) => {
    setCartNotification(itemName);
    setTimeout(() => setCartNotification(null), 3000);
  };

  const pageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const bgRotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { stiffness: 100, damping: 30 });
  const bgRotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), { stiffness: 100, damping: 30 });

  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    endpoints
      .cafe.menu()
      .then((res: any) => {
        const cats: CafeCategoryT[] = (res?.data || res?.categories || [])
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || null,
            sortOrder: c.sortOrder ?? 0,
            items: ((c.items || []) as CafeItemT[])
              .slice()
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
          }))
          .sort((a: CafeCategoryT, b: CafeCategoryT) => a.sortOrder - b.sortOrder);
        setCategories(cats);
        setActiveCategory(prev => (prev && cats.some(c => c.id === prev) ? prev : cats[0]?.id || ''));
      })
      .catch(() => setCategories([]))
      .finally(() => setMenuLoading(false));
  }, []);

  const activeCategoryData = categories.find(c => c.id === activeCategory);
  const activeStyle = styleFor(activeCategoryData);

  const getFilteredItems = () => {
    const orderable = (items: CafeItemT[]) => items.filter(i => i.isAvailable !== false);

    if (!searchQuery) {
      return { type: 'category' as const, items: orderable(activeCategoryData?.items || []) };
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{ item: CafeItemT; categoryId: string; categoryTitle: string }> = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (item.isAvailable === false) return;
        const haystack = `${item.name} ${item.description || ''}`.toLowerCase();
        if (haystack.includes(query)) {
          results.push({ item, categoryId: cat.id, categoryTitle: cat.name });
        }
      });
    });
    return { type: 'search' as const, items: results };
  };

  const filteredItems = getFilteredItems();

  const handleAddToCart = (item: CafeItemT) => {
    addItem({ itemId: item.id, name: item.name, price: Number(item.price) || 0 });
    showNotification(item.name);
  };

  const handlePlaceOrder = async () => {
    if (!tableCottageInput.trim()) return;
    if (cartItems.length === 0) return;
    if (cartItems.some(i => !i.itemId)) {
      alert('Some items could not be identified. Please refresh the page and try again.');
      return;
    }
    setOrdering(true);
    try {
      const seatLabel = orderType === 'table' ? `Table ${tableCottageInput.trim()}` : `Cottage ${tableCottageInput.trim()}`;
      const res = await endpoints.cafe.createOrder({
        tableNumber: orderType === 'table' ? parseInt(tableCottageInput, 10) || 1 : 99,
        guestName: guestName.trim() ? `${guestName.trim()} (${seatLabel})` : seatLabel,
        items: cartItems.map(i => ({
          itemId: i.itemId,
          name: i.name,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      });
      const data = res?.data || res;
      const items: ReceiptItem[] = (Array.isArray(data?.items) && data.items.length > 0
        ? data.items
        : cartItems.map(ci => ({
            name: ci.name,
            quantity: ci.quantity,
            unitPrice: ci.price,
            totalPrice: ci.price * ci.quantity,
          }))
      ).map((it: any) => ({
        name: String(it.name || 'Menu item'),
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        totalPrice: Number(it.totalPrice) || 0,
      }));
      setPlacedOrder({
        orderRef: data?.orderRef || 'ORDER',
        placedAt: normaliseDbDate(data?.createdAt),
        guestName: guestName.trim() || null,
        seatLabel,
        tableNumber: Number(data?.tableNumber) || (orderType === 'table' ? parseInt(tableCottageInput, 10) || 1 : 99),
        items,
        totalAmount: Number(data?.totalAmount) || items.reduce((sum, it) => sum + it.totalPrice, 0),
        status: data?.status || 'PENDING',
        paymentStatus: data?.paymentStatus || 'PENDING',
      });
      clearCart();
      setShowCheckout(false);
      setTableCottageInput('');
      setGuestName('');
    } catch (err: any) {
      alert(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const ActiveIcon = activeStyle.icon;

  return (
    <div ref={pageRef} className="min-h-screen bg-white dark:bg-[#140D07] overflow-hidden">
      <div className="relative z-10">
        <section className="relative pt-20 h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80)', transform: 'scale(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/10" />
          <div className="relative z-10 text-center px-4 max-w-4xl mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gold-400 text-sm tracking-[0.3em] uppercase mb-3 font-sans drop-shadow-lg">The Vedara</p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-4 tracking-wide drop-shadow-lg">
                The Perch
              </h1>
              <p className="text-white text-lg md:text-xl max-w-2xl mx-auto font-light drop-shadow-lg">
                A Himalayan culinary journey, from mountain mornings to starlit dinners
              </p>
            </motion.div>
          </div>
        </section>

        <nav className="sticky top-0 z-30 bg-white dark:bg-[#231B12] border-b border-gray-100 dark:border-white/10 shadow-sm" aria-label="Menu categories">
          <div className="vintage-container">
            <div className="flex items-center gap-3 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Link href="/" className="shrink-0 p-2 -ml-2 text-gray-400 dark:text-[#B8A385] hover:text-vedara-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-[#B8A385]" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2E2519] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#F3ECDA] placeholder:text-gray-400 dark:placeholder:text-[#B8A385] focus:outline-none focus:ring-2 focus:ring-vedara-900/20 focus:border-vedara-900"
                />
              </div>
            </div>
            <div className="relative">
              <div
                ref={(el) => {
                  if (el) {
                    const activeBtn = el.querySelector('[data-active="true"]');
                    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }
                }}
                className="flex gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map(cat => {
                  const CatIcon = styleFor(cat).icon;
                  return (
                    <button
                      key={cat.id}
                      data-active={activeCategory === cat.id}
                      onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                        activeCategory === cat.id
                          ? 'bg-vedara-900 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-[#2E2519] text-gray-600 dark:text-[#B8A385] hover:bg-gray-200 dark:hover:bg-[#2E2519]/80'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-white dark:from-[#140D07] to-transparent pointer-events-none" />
            </div>
          </div>
        </nav>

        <div className="vintage-container pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-gray-500 dark:text-[#B8A385]">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-vedara-900" />
              <span><strong className="text-gray-900 dark:text-[#F3ECDA]">Breakfast:</strong> 7:30 AM - 10:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-vedara-900" />
              <span><strong className="text-gray-900 dark:text-[#F3ECDA]">Lunch:</strong> 12:00 PM - 3:30 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-vedara-900" />
              <span><strong className="text-gray-900 dark:text-[#F3ECDA]">Dinner:</strong> 7:00 PM - 10:00 PM</span>
            </div>
          </div>
        </div>

        <div className="vintage-container py-8 md:py-12 pb-28">
          {menuLoading || categories.length === 0 ? (
            <div className="text-center py-24">
              <Coffee className={`w-10 h-10 text-gray-300 dark:text-[#B8A385] mx-auto mb-4 ${menuLoading ? 'animate-pulse' : ''}`} />
              <p className="text-sm text-gray-400 dark:text-[#B8A385]">
                {menuLoading
                  ? 'Loading the menu…'
                  : 'The menu is being updated. Please check back in a moment.'}
              </p>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery ? `search-${searchQuery}` : activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredItems.type === 'search' && searchQuery ? (
                <div>
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 dark:text-[#F3ECDA] mb-3">
                      Search Results
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-[#B8A385]">
                      {filteredItems.items.length} result{filteredItems.items.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo; across all categories
                    </p>
                  </div>

                  {Object.entries(
                    filteredItems.items.reduce((acc, entry) => {
                      const key = entry.categoryId;
                      if (!acc[key]) {
                        acc[key] = { title: entry.categoryTitle, items: [] as Array<{ item: CafeItemT; categoryId: string; categoryTitle: string }> };
                      }
                      acc[key].items.push(entry);
                      return acc;
                    }, {} as Record<string, { title: string; items: Array<{ item: CafeItemT; categoryId: string; categoryTitle: string }> }>)
                  ).map(([categoryId, { title, items }]) => (
                    <div key={categoryId} className="mb-12">
                      <h3 className="font-serif text-2xl text-gray-900 dark:text-[#F3ECDA] mb-6 pb-2 border-b border-gray-200 dark:border-white/10">
                        {title}
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {items.map(({ item }) => {
                          const localId = item.id;
                          const isFlipped = flippedIds[localId];
                          const cartItem = cartItems.find(ci => ci.itemId === item.id);
                          const qty = cartItem?.quantity || 0;
                          return (
                            <TiltCard key={localId} className="group perspective-[1000px] h-52">
                              <motion.div
                                className="relative w-full h-full cursor-pointer"
                                style={{ transformStyle: 'preserve-3d' }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                onClick={() => toggleFlip(localId)}
                              >
                                <div
                                  className="absolute inset-0 bg-white dark:bg-[#231B12] border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between"
                                  style={{ backfaceVisibility: 'hidden' }}
                                >
                                  <div>
                                    <h3 className="font-serif text-base text-gray-900 dark:text-[#F3ECDA] leading-snug mb-1.5">{item.name}</h3>
                                    {item.description && item.description !== item.name && <p className="text-xs text-gray-500 dark:text-[#B8A385] line-clamp-2">{item.description}</p>}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-vedara-900">{formatPrice(item.price)}</span>
                                    <span className="text-[10px] text-gray-400 dark:text-[#B8A385]">Tap to flip</span>
                                  </div>
                                </div>

                                <div
                                  className="absolute inset-0 bg-white dark:bg-[#231B12] border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between"
                                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                  <div>
                                    {item.description && item.description !== item.name && <p className="text-xs text-gray-500 dark:text-[#B8A385] leading-relaxed mb-3">{item.description}</p>}
                                    <div className="flex items-center gap-2 mb-3">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      <span className="text-sm font-semibold text-vedara-900">{formatPrice(item.price)}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {qty > 0 ? (
                                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#2E2519] rounded-full px-2 py-1">
                                        <button
                                          onClick={() => { if (qty === 1) removeItem(cartItem!.itemId); else updateQuantity(cartItem!.itemId, qty - 1); }}
                                          className="w-8 h-8 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-[#F3ECDA] min-w-[20px] text-center">{qty}</span>
                                        <button
                                          onClick={() => handleAddToCart(item)}
                                          className="w-8 h-8 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAddToCart(item)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-vedara-900 text-white text-xs font-medium hover:bg-vedara-900/80 transition-all shadow-md"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </TiltCard>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {filteredItems.items.length === 0 && (
                    <div className="text-center py-20">
                      <Search className="w-12 h-12 text-gray-300 dark:text-[#B8A385] mx-auto mb-4" />
                      <p className="text-gray-400 dark:text-[#B8A385]">No items found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-vedara-900 text-white text-sm font-medium mb-4 shadow-md">
                      <ActiveIcon className="w-4 h-4" />
                      {activeStyle.subtitle}
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 dark:text-[#F3ECDA] mb-3">
                      {activeCategoryData?.name}
                    </h2>
                    {activeCategoryData?.description && (
                      <p className="text-sm text-gray-500 dark:text-[#B8A385] max-w-xl mx-auto">
                        {activeCategoryData.description}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {(filteredItems.type === 'category' ? filteredItems.items : []).map(item => {
                      const localId = item.id;
                      const isFlipped = flippedIds[localId];
                      const cartItem = cartItems.find(ci => ci.itemId === item.id);
                      const qty = cartItem?.quantity || 0;
                      return (
                        <TiltCard key={localId} className="group perspective-[1000px] h-52">
                          <motion.div
                            className="relative w-full h-full cursor-pointer"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            onClick={() => toggleFlip(localId)}
                          >
                            <div
                              className="absolute inset-0 bg-white dark:bg-[#231B12] border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <div>
                                <h3 className="font-serif text-base text-gray-900 dark:text-[#F3ECDA] leading-snug mb-1.5">{item.name}</h3>
                                {item.description && item.description !== item.name && <p className="text-xs text-gray-500 dark:text-[#B8A385] line-clamp-2">{item.description}</p>}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-vedara-900">{formatPrice(item.price)}</span>
                                <span className="text-[10px] text-gray-400 dark:text-[#B8A385]">Tap to flip</span>
                              </div>
                            </div>

                            <div
                              className="absolute inset-0 bg-white dark:bg-[#231B12] border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between"
                              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                              <div>
                                {item.description && item.description !== item.name && <p className="text-xs text-gray-500 dark:text-[#B8A385] leading-relaxed mb-3">{item.description}</p>}
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span className="text-sm font-semibold text-vedara-900">{formatPrice(item.price)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                {qty > 0 ? (
                                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#2E2519] rounded-full px-2 py-1">
                                    <button
                                      onClick={() => { if (qty === 1) removeItem(cartItem!.itemId); else updateQuantity(cartItem!.itemId, qty - 1); }}
                                      className="w-8 h-8 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-[#F3ECDA] min-w-[20px] text-center">{qty}</span>
                                    <button
                                      onClick={() => handleAddToCart(item)}
                                      className="w-8 h-8 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-vedara-900 text-white text-xs font-medium hover:bg-vedara-900/80 transition-all shadow-md"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </TiltCard>
                      );
                    })}
                  </div>

                  {filteredItems.type === 'category' && filteredItems.items.length === 0 && (
                    <div className="text-center py-20">
                      <Search className="w-12 h-12 text-gray-300 dark:text-[#B8A385] mx-auto mb-4" />
                      <p className="text-gray-400 dark:text-[#B8A385]">No items found</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
          )}

          <div className="mt-16 text-center">
            <div className="bg-gray-50 dark:bg-[#2E2519] border border-gray-200 dark:border-white/10 rounded-xl inline-block px-8 py-6">
              <Mountain className="w-5 h-5 text-gray-400 dark:text-[#B8A385] mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-[#B8A385] max-w-md">
                All prices are in INR and include applicable taxes. Pre-orders for select items require 24-hour notice.
                For special dietary requirements, please inform our staff. The Perch does not serve alcoholic beverages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {placedOrder && (
        <OrderReceipt order={placedOrder} onClose={() => setPlacedOrder(null)} />
      )}

      {cartNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-vedara-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">&ldquo;{cartNotification}&rdquo; added to cart!</span>
          <button
            onClick={() => { setShowCheckout(true); setCartNotification(null); }}
            className="text-xs font-semibold bg-white dark:bg-[#231B12] text-vedara-900 dark:text-[#F3ECDA] px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2E2519] transition-colors"
          >
            View Cart
          </button>
        </motion.div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCheckout(false)}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#231B12] p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
          >
            <h3 className="font-serif text-xl text-gray-900 dark:text-[#F3ECDA] mb-4">Place Your Order</h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setOrderType('table')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  orderType === 'table' ? 'bg-vedara-900 text-white shadow-md' : 'bg-gray-100 dark:bg-[#2E2519] text-gray-600 dark:text-[#B8A385]'
                }`}
              >
                <Store className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setOrderType('cottage')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  orderType === 'cottage' ? 'bg-vedara-900 text-white shadow-md' : 'bg-gray-100 dark:bg-[#2E2519] text-gray-600 dark:text-[#B8A385]'
                }`}
              >
                <Home className="w-4 h-4" />
                Cottage
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-1.5">
                {orderType === 'table' ? 'Table Number' : 'Cottage Name'}
              </label>
              <input
                type={orderType === 'table' ? 'number' : 'text'}
                min="1"
                placeholder={orderType === 'table' ? 'e.g. 3' : 'e.g. Monal Haven'}
                value={tableCottageInput}
                onChange={e => setTableCottageInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#2E2519] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#F3ECDA] text-sm placeholder:text-gray-400 dark:placeholder:text-[#B8A385] focus:outline-none focus:ring-2 focus:ring-vedara-900/20 focus:border-vedara-900"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs text-muted-foreground mb-1.5">Your Name (optional)</label>
              <input
                type="text"
                placeholder="Your name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#2E2519] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#F3ECDA] text-sm placeholder:text-gray-400 dark:placeholder:text-[#B8A385] focus:outline-none focus:ring-2 focus:ring-vedara-900/20 focus:border-vedara-900"
              />
            </div>

            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {cartItems.map(ci => (
                <div key={ci.itemId} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{ci.name}</p>
                    <p className="text-xs text-muted-foreground">{ci.quantity} × {formatPrice(ci.price)} = {formatPrice(ci.price * ci.quantity)}</p>
                  </div>
                  <button onClick={() => removeItem(ci.itemId)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10 mb-1">
              <span className="text-sm text-gray-500 dark:text-[#B8A385]">Total</span>
              <span className="text-lg font-bold text-vedara-900">{formatPrice(total())}</span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-[#B8A385] mb-6">
              Payable at the desk after your order — cash, UPI or card. No online payment.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setShowCheckout(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-[#2E2519] text-gray-600 dark:text-[#B8A385] text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#2E2519]/80 transition-colors">
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={ordering || !tableCottageInput.trim() || cartItems.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-vedara-900 text-white text-sm font-medium hover:bg-vedara-900/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {ordering ? 'Placing...' : (
                  <>
                    <Send className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCheckout(true)}
          className="relative w-14 h-14 rounded-full bg-vedara-900 text-white shadow-xl hover:bg-vedara-900/80 transition-colors flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount() > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
              {itemCount()}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
