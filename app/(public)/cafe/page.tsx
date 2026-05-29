'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CafeCategory, CafeItem, CafeOrder } from '@/types';
import { endpoints } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { CouponBanner } from '@/components/public/CouponBanner';
import { useSocketStore } from '@/store/socket';
import {
  Coffee, Plus, Minus, ShoppingBag, X, Leaf, Check, User,
  Clock, UtensilsCrossed, Sparkles, ArrowRight, Bell, Radio,
  Soup, Pizza, Cookie
} from 'lucide-react';

const popularItems = [
  { name: 'Forest Brew Coffee', price: 250, desc: 'Hand-poured single-origin brew', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
  { name: 'Wood-Fired Pizza', price: 450, desc: 'Stone-baked with mountain herbs', icon: Pizza, color: 'bg-orange-100 text-orange-700' },
  { name: 'Wild Mushroom Soup', price: 320, desc: 'Foraged from local forests', icon: Soup, color: 'bg-green-100 text-green-700' },
  { name: 'Himalayan Honey Cake', price: 280, desc: 'Baked with raw valley honey', icon: Cookie, color: 'bg-yellow-100 text-yellow-700' },
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

  const sortedMenu = menu.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Cafe Charade</p>
            <BackButton />
            <TextReveal as="h1" className="section-title max-w-3xl">
              Cafe Charade
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
                <h2 className="font-serif text-3xl md:text-4xl text-cream-50 mb-4">Where Every Meal Tells a Story</h2>
                <p className="text-cream-200/80 leading-relaxed mb-6">
                  Nestled beside a whispering stream, our cafe is more than a place to eat - it is a space where time slows down. The aroma of freshly ground coffee mingles with the scent of pine, and every dish is crafted with ingredients sourced from the surrounding valleys.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-cream-200 text-sm bg-white/10 rounded-full px-4 py-2">
                    <Clock className="w-3.5 h-3.5 text-clay-300" /> Breakfast: 7:30 - 10:00 AM
                  </div>
                  <div className="flex items-center gap-2 text-cream-200 text-sm bg-white/10 rounded-full px-4 py-2">
                    <Clock className="w-3.5 h-3.5 text-clay-300" /> Lunch: 12:00 - 3:30 PM
                  </div>
                  <div className="flex items-center gap-2 text-cream-200 text-sm bg-white/10 rounded-full px-4 py-2">
                    <Clock className="w-3.5 h-3.5 text-clay-300" /> Dinner: 7:00 - 10:00 PM
                  </div>
                  <div className="flex items-center gap-2 text-cream-200 text-sm bg-white/10 rounded-full px-4 py-2">
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
                    className="vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-4 text-center"
                    whileHover={{ y: -2 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-cream-50 text-sm font-medium">{item.name}</p>
                    <p className="text-cream-200/60 text-xs mt-0.5">{formatPrice(item.price)}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CouponBanner />

      <section className="pb-8 pt-12">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="bg-card border border-border rounded-2xl p-4 md:p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-clay-500" />
                <span className="font-medium text-sm text-foreground">Your Table</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTableNumber(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      tableNumber === n
                        ? 'bg-forest-600 text-cream-50'
                        : 'bg-earth-100 dark:bg-earth-800 text-earth-700 dark:text-cream-200 hover:bg-earth-200'
                    }`}
                  >
                    Table {n}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {sortedMenu.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-forest-600 text-cream-50'
                    : 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-cream-300 hover:bg-earth-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
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
            sortedMenu.filter((cat) => cat.slug === activeCategory).map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6">
                  <h2 className="font-serif text-2xl text-foreground mb-1">{category.name}</h2>
                  {category.description && (
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => {
                    const cartItem = items.find((i) => i.itemId === item.id);
                    return (
                      <div key={item.id} className="vintage-card p-5 flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            {item.isVegetarian && <Leaf className="w-3 h-3 text-forest-500 flex-shrink-0" />}
                          </div>
                          {item.description && (
                            <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{item.description}</p>
                          )}
                          <span className="text-forest-600 dark:text-forest-400 font-semibold text-sm">{formatPrice(item.price)}</span>
                          {cartItem && (
                            <Badge variant="success" size="sm" className="ml-2">
                              {cartItem.quantity} in cart
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {cartItem && (
                            <button
                              onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-earth-100 dark:bg-earth-700 flex items-center justify-center hover:bg-earth-200 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => addItem({ itemId: item.id, name: item.name, price: item.price })}
                            className="w-8 h-8 rounded-full bg-forest-600 text-cream-50 flex items-center justify-center hover:bg-forest-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-forest-600 to-forest-800 rounded-2xl p-8 md:p-10 text-center text-cream-50">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-clay-300" />
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Reserve a Table</h2>
              <p className="text-cream-200/80 max-w-lg mx-auto mb-6">
                Planning a special evening? Reserve your table at Cafe Charade and let us curate a memorable dining experience amidst the mountains.
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
          <Badge variant="success" size="sm" className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 animate-pulse" /> Live
          </Badge>
        </div>
      )}

      {orderStatus && activeOrder && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-forest-600 text-cream-50 rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3"
          >
            <Bell className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Order {activeOrder.orderRef}</p>
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
            className="bg-clay-500 text-cream-50 rounded-full px-5 py-3 shadow-lg hover:bg-clay-600 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium">{itemCount()} items - {formatPrice(total())}</span>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-cream-50 dark:bg-earth-800 w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl text-foreground">Your Order</h3>
                <button onClick={() => setShowCart(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-7 h-7 rounded-full bg-earth-100 dark:bg-earth-700 flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-earth-100 dark:bg-earth-700 flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-16 text-right">{formatPrice(item.price * item.quantity)}</span>
                          <button onClick={() => removeItem(item.itemId)} className="text-red-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-6 pt-2">
                    <span className="font-serif text-lg text-foreground">Total</span>
                    <span className="font-bold text-lg text-forest-600 dark:text-forest-400">{formatPrice(total())}</span>
                  </div>

                  <div className="space-y-3">
                    {!showCheckout ? (
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={clearCart} className="flex-1">Clear</Button>
                        <Button variant="primary" onClick={() => setShowCheckout(true)} className="flex-1">
                          Proceed to Order
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Your name (optional)"
                          className="vintage-input"
                        />
                        <div className="flex gap-3">
                          <Button variant="secondary" onClick={() => setShowCheckout(false)} className="flex-1">Back</Button>
                          <Button variant="primary" onClick={handleOrder} className="flex-1">
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
            className="fixed top-20 right-6 z-50 bg-forest-600 text-cream-50 rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            <div>
              <span className="text-sm">Order placed successfully!</span>
              {activeOrder && <p className="text-xs text-cream-200">Ref: {activeOrder.orderRef}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
