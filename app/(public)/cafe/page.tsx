'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CafeCategory, CafeItem, CafeOrder } from '@/types';
import { endpoints } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useSocketStore } from '@/store/socket';
import {
  Coffee, Plus, Minus, ShoppingBag, X, Leaf, Check, User,
  Clock, UtensilsCrossed, Sparkles, ArrowRight, Bell, Radio,
  Soup, Pizza, Cookie, Search
} from 'lucide-react';

const popularItems = [
  { name: 'Forest Brew Coffee', price: 250, desc: 'Hand-poured single-origin brew', icon: Coffee, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { name: 'Wood-Fired Pizza', price: 450, desc: 'Stone-baked with mountain herbs', icon: Pizza, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { name: 'Wild Mushroom Soup', price: 320, desc: 'Foraged from local forests', icon: Soup, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { name: 'Himalayan Honey Cake', price: 280, desc: 'Baked with raw valley honey', icon: Cookie, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
];

export default function CafePage() {
  const [menu, setMenu] = useState<CafeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeOrder, setActiveOrder] = useState<CafeOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  
  // Custom states for search & veg filter
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);

  const { items, tableNumber, setTableNumber, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();
  const { socket, connected, connect } = useSocketStore();

  useEffect(() => {
    connect();
    endpoints.cafe.menu().then((res: any) => {
      setMenu(res.data);
      if (res.data.length > 0) setActiveCategory(res.data[0].slug);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [connect]);

  useEffect(() => {
    if (!socket || !activeOrder) return;
    const handleStatus = (data: { orderRef: string; status: string }) => {
      if (data.orderRef === activeOrder.orderRef) {
        setOrderStatus(data.status);
        if (data.status === 'READY' || data.status === 'SERVED') {
          setTimeout(() => {
            setOrderStatus(null);
            setActiveOrder(null);
          }, 5000);
        }
      }
    };
    socket.on('order:status', handleStatus);
    return () => { socket.off('order:status', handleStatus); };
  }, [socket, activeOrder]);

  const handleOrder = async () => {
    try {
      const res = await endpoints.cafe.createOrder({
        tableNumber,
        guestName,
        items: items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      });
      setActiveOrder(res.data || res);
      setOrderSuccess(true);
      if (socket) {
        socket.emit('order:track', { orderRef: res.data?.orderRef || res.orderRef });
      }
      clearCart();
      setTimeout(() => setOrderSuccess(false), 3000);
      setShowCart(false);
      setShowCheckout(false);
    } catch (err) {
      alert('Order failed. Please try again.');
    }
  };

  const sortedMenu = useMemo(() => {
    return [...menu].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [menu]);

  // Helper to map category names or slugs to Lucide icons
  const getCategoryIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('bev') || s.includes('drink') || s.includes('coffe') || s.includes('chai')) {
      return Coffee;
    }
    if (s.includes('pizz')) {
      return Pizza;
    }
    if (s.includes('soup') || s.includes('broth')) {
      return Soup;
    }
    if (s.includes('dessert') || s.includes('sweet') || s.includes('cake') || s.includes('bakery')) {
      return Cookie;
    }
    if (s.includes('salad') || s.includes('green') || s.includes('veg')) {
      return Leaf;
    }
    return UtensilsCrossed;
  };

  return (
    <>
      <section className="pt-32 pb-16 bg-cream-50 dark:bg-earth-900 transition-colors">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 dark:text-cream-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans font-semibold">The Forest Pantry</p>
            <TextReveal as="h1" className="section-title max-w-3xl font-serif">
              Good Food, Mountain Mood
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-16 bg-forest-700 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-clay-300 text-sm tracking-[0.2em] uppercase mb-3 font-sans">The Ambiance</p>
                <h2 className="font-serif text-3xl md:text-4xl text-cream-50 mb-4 font-bold">Where Every Meal Tells a Story</h2>
                <p className="text-cream-200/80 leading-relaxed mb-6">
                  Nestled beside a whispering stream, our cafe is more than a place to eat — it is a space where time slows down. The aroma of freshly ground coffee mingles with the scent of pine, and every dish is crafted with ingredients sourced from the surrounding valleys.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-cream-200 text-sm bg-white/10 rounded-full px-4 py-2 border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-clay-300 animate-pulse" /> 7:00 AM – 9:00 PM
                  </div>
                  <div className="flex items-center gap-2 text-cream-200 text-sm bg-white/10 rounded-full px-4 py-2 border border-white/5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-clay-300" /> Multi-cuisine
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {popularItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    className="vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-4 text-center hover:border-white/20 transition-colors"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-cream-50 text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-cream-200/60 text-xs mt-0.5">{formatPrice(item.price)}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-12 bg-cream-50 dark:bg-earth-900 transition-colors" id="menu-section">
        <div className="vintage-container">
          
          {/* Table dining experience banner / selector */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-earth-800/80 border border-earth-200/50 dark:border-earth-700/50 rounded-2xl p-5 mb-8 backdrop-blur-md shadow-sm">
              <div className="flex-1">
                <h3 className="font-serif text-lg text-foreground font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-forest-600 dark:text-cream-400" />
                  Table Dining Experience
                </h3>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  {tableNumber 
                    ? `You are currently ordering for Table ${tableNumber}. Your dishes will be served directly to your table.` 
                    : 'Please select your Table Number below to place a direct digital order.'}
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTableNumber(n)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      tableNumber === n
                        ? 'bg-forest-600 text-cream-50 ring-2 ring-forest-600/30 ring-offset-2 dark:ring-offset-earth-800 scale-105'
                        : 'bg-white dark:bg-earth-700 text-earth-700 dark:text-cream-300 border border-earth-200 dark:border-earth-600 hover:bg-earth-100 dark:hover:bg-earth-650'
                    }`}
                  >
                    T{n}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Search bar & Vegetarian Toggle Panel */}
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              
              {/* Fuzzy Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes (e.g. coffee, pizza)..."
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-earth-200 dark:border-earth-750 bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest-600/30 dark:focus:ring-cream-400/20 focus:border-forest-600 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Vegetarian Toggle Switch */}
              <div className="flex items-center gap-3 bg-white/70 dark:bg-earth-800/70 border border-earth-200 dark:border-earth-750 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-bold text-earth-700 dark:text-cream-200">Veg Only</span>
                <button
                  onClick={() => setOnlyVeg(!onlyVeg)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    onlyVeg ? 'bg-emerald-600' : 'bg-earth-300 dark:bg-earth-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      onlyVeg ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Sticky Category Tabs with Glassmorphism */}
          <div className="sticky top-16 md:top-20 z-35 -mx-4 px-4 py-4 bg-cream-50/95 dark:bg-earth-900/95 backdrop-blur-md border-b border-earth-200/50 dark:border-earth-800/50 transition-all duration-300 overflow-x-auto scrollbar-hide flex gap-3 mb-8">
            {sortedMenu.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`flex items-center gap-2.5 whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm border ${
                    isActive
                      ? 'bg-forest-600 border-forest-600 text-cream-50 scale-102 shadow-forest-600/10'
                      : 'bg-white dark:bg-earth-800 border-earth-200 dark:border-earth-700/50 text-earth-650 dark:text-cream-300 hover:bg-earth-50 dark:hover:bg-earth-750'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cream-50' : 'text-forest-600 dark:text-cream-400'}`} />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="vintage-card animate-pulse p-6">
                  <div className="h-5 bg-earth-200 dark:bg-earth-700 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-earth-200 dark:bg-earth-700 rounded w-full mb-2" />
                  <div className="h-4 bg-earth-200 dark:bg-earth-700 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            sortedMenu.filter((cat) => cat.slug === activeCategory).map((category) => {
              
              // Apply fuzzy search and veg filter in-memory
              const filteredItems = category.items.filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesVeg = !onlyVeg || item.isVegetarian;
                return matchesSearch && matchesVeg;
              });

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl text-foreground font-bold mb-1">{category.name}</h2>
                    {category.description && (
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    )}
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white/40 dark:bg-earth-800/40 rounded-2xl border border-dashed border-earth-200 dark:border-earth-750/70">
                      <UtensilsCrossed className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-55" />
                      <p className="text-earth-700 dark:text-cream-200 font-serif text-base font-medium">No items found</p>
                      <p className="text-muted-foreground text-xs mt-1">Try modifying your search or toggling the filters.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredItems.map((item) => {
                        const cartItem = items.find((i) => i.itemId === item.id);
                        const isVeg = item.isVegetarian;
                        
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`vintage-card p-5 flex justify-between items-center gap-4 transition-all duration-350 relative overflow-hidden ${
                              cartItem
                                ? 'border-forest-600 dark:border-forest-500 shadow-md ring-1 ring-forest-600/10 bg-white/95 dark:bg-earth-800/95'
                                : 'bg-white/80 dark:bg-earth-800/80 hover:border-earth-300 dark:hover:border-earth-700 hover:shadow-md'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {/* Standard Veg / Non-Veg Indicator Square */}
                                <div 
                                  className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 rounded-[4px] p-[2.5px] ${
                                    isVeg ? 'border-emerald-600 dark:border-emerald-500' : 'border-rose-600 dark:border-rose-500'
                                  }`} 
                                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-rose-600 dark:bg-rose-500'}`} />
                                </div>
                                <h3 className="font-serif text-base text-foreground font-semibold truncate tracking-wide">{item.name}</h3>
                              </div>
                              {item.description && (
                                <p className="text-muted-foreground text-xs mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-forest-600 dark:text-forest-400 font-bold text-sm tracking-wide">{formatPrice(item.price)}</span>
                                {cartItem && (
                                  <Badge variant="success" size="sm" className="bg-forest-600/10 text-forest-750 dark:text-forest-300 font-bold">
                                    {cartItem.quantity} selected
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Zomato/Swiggy-style Morphing ADD Button */}
                            <div className="flex-shrink-0">
                              <AnimatePresence mode="wait">
                                {!cartItem ? (
                                  <motion.button
                                    key="add-btn"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addItem({ itemId: item.id, name: item.name, price: item.price })}
                                    className="h-8 px-4 rounded-full bg-forest-600 text-cream-50 hover:bg-forest-700 text-xs font-bold tracking-wider flex items-center gap-1 shadow-sm transition-all duration-200 border border-forest-600"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> ADD
                                  </motion.button>
                                ) : (
                                  <motion.div
                                    key="qty-pill"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="h-8 rounded-full border border-forest-600 dark:border-forest-500 bg-forest-50 dark:bg-earth-700 flex items-center justify-between p-1 min-w-[90px] shadow-sm"
                                  >
                                    <button
                                      onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                                      className="w-6 h-6 rounded-full text-forest-700 dark:text-forest-300 hover:bg-forest-150 dark:hover:bg-earth-600 flex items-center justify-center transition-colors"
                                    >
                                      <Minus className="w-3 h-3 font-bold" />
                                    </button>
                                    <span className="text-xs font-bold text-forest-800 dark:text-forest-200 px-1 w-6 text-center">{cartItem.quantity}</span>
                                    <button
                                      onClick={() => addItem({ itemId: item.id, name: item.name, price: item.price })}
                                      className="w-6 h-6 rounded-full text-forest-700 dark:text-forest-300 hover:bg-forest-150 dark:hover:bg-earth-600 flex items-center justify-center transition-colors"
                                    >
                                      <Plus className="w-3 h-3 font-bold" />
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      <section className="pb-20 bg-cream-50 dark:bg-earth-900 transition-colors">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-forest-600 to-forest-800 rounded-2xl p-8 md:p-10 text-center text-cream-50 shadow-md">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-clay-300 animate-bounce" />
              <h2 className="font-serif text-2xl md:text-3xl mb-3 font-bold">Reserve a Table</h2>
              <p className="text-cream-200/80 max-w-lg mx-auto mb-6 text-sm">
                Planning a special evening? Reserve your table at The Forest Pantry and let us curate a memorable dining experience amidst the mountains.
              </p>
              <Button variant="secondary" size="lg" onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Browse Menu <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {connected && (
        <div className="fixed top-20 right-6 z-30">
          <Badge variant="success" size="sm" className="flex items-center gap-1.5 shadow-sm bg-emerald-600 text-white border-none">
            <Radio className="w-3 h-3 animate-pulse" /> Live Menu
          </Badge>
        </div>
      )}

      {orderStatus && activeOrder && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-forest-600 text-cream-50 rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3 border border-forest-550"
          >
            <Bell className="w-5 h-5 text-clay-300 animate-swing" />
            <div>
              <p className="text-sm font-semibold">Order {activeOrder.orderRef}</p>
              <p className="text-xs text-cream-200">Status: {orderStatus}</p>
            </div>
          </motion.div>
        </div>
      )}

      {itemCount() > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-6 z-30"
        >
          <button
            onClick={() => setShowCart(!showCart)}
            className="bg-clay-500 text-cream-50 rounded-full px-5 py-3.5 shadow-xl hover:bg-clay-600 transition-all duration-200 flex items-center gap-2 hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 animate-bounce" />
            <span className="text-sm font-bold tracking-wide">{itemCount()} items • {formatPrice(total())}</span>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-cream-50 dark:bg-earth-800 w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl border border-earth-100 dark:border-earth-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5 border-b border-border/30 pb-3">
                <h3 className="font-serif text-xl text-foreground font-bold">Your Order</h3>
                <button onClick={() => setShowCart(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm font-medium">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex-1 pr-3 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-7 h-7 rounded-full bg-earth-100 dark:bg-earth-700 flex items-center justify-center hover:bg-earth-200 dark:hover:bg-earth-650 transition-colors">
                            <Minus className="w-3 h-3 text-foreground" />
                          </button>
                          <span className="text-sm font-bold text-foreground w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-earth-100 dark:bg-earth-700 flex items-center justify-center hover:bg-earth-200 dark:hover:bg-earth-650 transition-colors">
                            <Plus className="w-3 h-3 text-foreground" />
                          </button>
                          <span className="text-sm font-bold text-forest-600 dark:text-forest-400 w-16 text-right ml-2">{formatPrice(item.price * item.quantity)}</span>
                          <button onClick={() => removeItem(item.itemId)} className="text-red-400 hover:text-red-500 ml-1 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-6 pt-2 border-t border-border/20">
                    <span className="font-serif text-lg text-foreground font-semibold">Total</span>
                    <span className="font-bold text-xl text-forest-600 dark:text-forest-400">{formatPrice(total())}</span>
                  </div>

                  <div className="space-y-3">
                    {!showCheckout ? (
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={clearCart} className="flex-1 py-5 text-xs font-bold uppercase tracking-wider">Clear</Button>
                        <Button variant="primary" onClick={() => setShowCheckout(true)} className="flex-1 py-5 text-xs font-bold uppercase tracking-wider">
                          Proceed to Order
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Guest Name</label>
                          <input
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Enter your name (optional)"
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest-600/35 transition-all"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="secondary" onClick={() => setShowCheckout(false)} className="flex-1 py-5 text-xs font-bold uppercase tracking-wider">Back</Button>
                          <Button variant="primary" onClick={handleOrder} className="flex-1 py-5 text-xs font-bold uppercase tracking-wider">
                            Place Order
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-6 z-50 bg-forest-600 text-cream-50 rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3 border border-forest-550"
          >
            <Check className="w-5 h-5 text-clay-300" />
            <div>
              <span className="text-sm font-semibold">Order placed successfully!</span>
              {activeOrder && <p className="text-xs text-cream-200">Ref: {activeOrder.orderRef}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
