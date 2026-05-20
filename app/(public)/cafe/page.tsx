'use client';

import { useState, useEffect } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { CafeCategory, CafeItem } from '@/types';
import { endpoints } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { Coffee, Plus, Minus, ShoppingBag, X, Leaf, Check, User } from 'lucide-react';

export default function CafePage() {
  const [menu, setMenu] = useState<CafeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { items, tableNumber, setTableNumber, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();

  useEffect(() => {
    endpoints.cafe.menu().then((res: any) => {
      setMenu(res.data);
      if (res.data.length > 0) setActiveCategory(res.data[0].slug);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleOrder = async () => {
    try {
      await endpoints.cafe.createOrder({
        tableNumber,
        guestName,
        items: items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      });
      setOrderSuccess(true);
      clearCart();
      setTimeout(() => setOrderSuccess(false), 3000);
      setShowCart(false);
      setShowCheckout(false);
    } catch (err) {
      alert('Order failed. Please try again.');
    }
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">The Forest Pantry</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Good Food, Mountain Mood
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-8">
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
            {menu.map((cat) => (
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
            menu.filter((cat) => cat.slug === activeCategory).map((category) => (
              <div key={category.id}>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl text-foreground mb-1">{category.name}</h2>
                  {category.description && (
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
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
                      </div>
                      <button
                        onClick={() => addItem({ itemId: item.id, name: item.name, price: item.price })}
                        className="w-8 h-8 rounded-full bg-forest-600 text-cream-50 flex items-center justify-center hover:bg-forest-700 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {itemCount() > 0 && (
        <div className="fixed bottom-24 right-6 z-30">
          <button
            onClick={() => setShowCart(!showCart)}
            className="bg-clay-500 text-cream-50 rounded-full px-5 py-3 shadow-lg hover:bg-clay-600 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium">{itemCount()} items • {formatPrice(total())}</span>
          </button>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center" onClick={() => setShowCart(false)}>
          <div className="bg-cream-50 dark:bg-earth-800 w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-forest-600 text-cream-50 rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
          <Check className="w-5 h-5" />
          <span className="text-sm">Order placed successfully!</span>
        </div>
      )}
    </>
  );
}
