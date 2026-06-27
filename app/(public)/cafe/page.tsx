'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Coffee, Soup, Fish, Salad, UtensilsCrossed, IceCream, CupSoda, Cookie, Baby, Sparkles, Mountain, Leaf, ArrowLeft, ChevronDown, Search, ShoppingCart, Plus, Minus, Trash2, Send, Store, Home, CheckCircle, Moon } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { endpoints } from '@/lib/api';

type MenuItem = {
  name: string;
  price: string | number;
  desc: string;
  tags?: string[];
};

type MenuCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  items: MenuItem[];
  note?: string;
  color: string;
};

const menuData: MenuCategory[] = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    subtitle: '7:30 AM - 10:00 AM',
    icon: Coffee,
    color: 'from-amber-600 to-yellow-700',
    items: [
      { name: 'Himachali Paratha Breakfast', price: '280', desc: 'Freshly prepared traditional North Indian stuffed flatbread. Choice of Aloo, Gobhi or Paneer Paratha. Served with local butter, fresh curd, traditional Himachali pickle & seasonal fruits.' },
      { name: 'Farm Egg Breakfast', price: '280', desc: 'Farm fresh eggs cooked to your preference. Choice of Sunny Side Up, Plain/Masala Omelette or scrambled eggs. Served with toast, butter/jam, roasted potatoes & seasonal fruits.' },
      { name: 'Cinnamon French Toast', price: '280', desc: 'Golden pan-grilled French toast infused with cinnamon and vanilla. Served with fresh seasonal fruits, honey and chocolate syrup.' },
      { name: 'Pancake Breakfast', price: '295', desc: 'Freshly made homemade fluffy pancakes. Served with fresh seasonal fruits, honey and chocolate syrup.' },
      { name: 'Vedara Breakfast Sandwich', price: '295', desc: 'A wholesome toasted sandwich. Choice of Egg & Cheese, Egg Chicken & Cheese, Paneer Corn & Cheese, or Mushroom Corn & Cheese. Served with grilled vegetables, sausages & seasonal fruits.' },
      { name: 'Himalayan Smoothie Bowl', price: '320', desc: 'Refreshing breakfast bowl. Choice of Banana Peanut Butter, Mixed Berry, or Mango Coconut (seasonal). Topped with granola, fresh fruits, nuts & seeds.' },
      { name: 'English Breakfast Platter', price: '375', desc: 'Hearty platter with eggs cooked to preference, toast with butter/jam, sauteed vegetables, baked beans & chicken sausages.' },
      { name: 'Puri Bhaji', price: '245', desc: 'Fluffy golden puris served with slow-cooked Himachali style aloo bhaji, traditional pickle & fresh curd.' },
    ],
    note: 'Choose one beverage with breakfast: Milk Tea, Black Tea, Fresh Brewed Coffee, or Lemon Honey Ginger Tea',
  },
  {
    id: 'himachali',
    title: 'Himachali Specials',
    subtitle: 'Lunch / Dinner - Pre-order',
    icon: Mountain,
    color: 'from-vedara-900 to-vedara-900/80',
    items: [
      { name: 'Himachali Dham Platter', price: '590', desc: 'Traditional Himachali meal with Madra, Dal, Kadi, Khatta, Mitha, Steamed Rice, Pickle & Salad.' },
      { name: 'Tudki ya Bhath', price: '320', desc: 'Himachali rice cooked with lentils, spices and vegetables.' },
      { name: 'Pahadi Mutton Curry', price: '780', desc: 'Traditional Himachali style mutton curry served with rice or roti, onion salad & pickle.' },
      { name: 'Grilled Himalayan Trout', price: '890', desc: 'Fresh local trout grilled with lemon butter, served with lemon slices, salad, roasted potatoes & herbed rice.' },
    ],
  },
  {
    id: 'indian',
    title: 'Indian Comfort',
    subtitle: 'Lunch / Dinner',
    icon: Soup,
    color: 'from-red-700 to-orange-800',
    items: [
      { name: 'Smoked Yellow Dal Tadka', price: '260', desc: 'Slow-cooked yellow dal with aromatic tempering.' },
      { name: 'Slow Simmered Dal Makhani', price: '290', desc: 'Rich, creamy black lentils simmered overnight.' },
      { name: 'Mountain Style Rajma', price: '290', desc: 'Kidney beans in a spiced tomato gravy.' },
      { name: 'Paneer Bhurji', price: '360', desc: 'Scrambled cottage cheese with Indian spices.' },
      { name: 'Matar Paneer', price: '380', desc: 'Cottage cheese and peas in rich gravy (Dry/Gravy).' },
      { name: 'Mushroom Matar', price: '360', desc: 'Mushrooms and peas in spiced gravy.' },
      { name: 'Kadhai Paneer', price: '380', desc: 'Cottage cheese cooked in kadhai masala.' },
      { name: 'Himachali Sepu Vadi', price: '290', desc: 'Traditional Himachali lentil dumplings in gravy.' },
      { name: 'Jeera / Chatpate / Methi Aloo', price: '240', desc: 'Potatoes prepared three ways.' },
      { name: 'Seasonal Mixed Vegetable Sabji', price: '280', desc: 'Fresh seasonal vegetables of the day.' },
      { name: 'Egg Bhurji', price: '260', desc: 'Scrambled eggs with Indian spices.' },
      { name: 'Egg Curry', price: '290', desc: 'Boiled eggs in spiced onion-tomato gravy.' },
      { name: 'Farm Fresh Thali (Veg)', price: '450', desc: 'Complete meal with dal, sabji, roti, rice, salad & dessert.' },
      { name: 'Farm Fresh Thali (Non-Veg)', price: '530', desc: 'Complete meal with chicken curry, dal, roti, rice, salad & dessert.' },
      { name: 'Kadhai Murg', price: '440', desc: 'Chicken cooked in kadhai masala with bell peppers.' },
      { name: 'Murg Rahra', price: '480', desc: 'Chicken in creamy onion-yogurt gravy.' },
      { name: 'Mutton Rogan Josh', price: '720', desc: 'Kashmiri-style slow-cooked mutton (pre-order only).' },
    ],
    note: 'Breads: Tawa Roti (Plain/Butter) 30/50 | Plain Paratha 90 | Steamed Rice 160 | Jeera Rice 210 | Vegetable Pulao 240',
  },
  {
    id: 'continental',
    title: 'Continental',
    subtitle: 'Lunch / Dinner',
    icon: UtensilsCrossed,
    color: 'from-stone-700 to-amber-900',
    items: [
      { name: 'Rosemary Roasted Paneer', price: '540', desc: 'Paneer with mashed potatoes and sauteed veggies.' },
      { name: 'Rosemary Roasted Chicken', price: '620', desc: 'Roasted chicken with mashed potatoes and sauteed veggies.' },
      { name: 'White Sauce Pasta (Veg)', price: '460', desc: 'Creamy pasta with vegetables, served with garlic bread.' },
      { name: 'White Sauce Pasta (Chicken)', price: '520', desc: 'Creamy pasta with chicken, served with garlic bread.' },
      { name: 'Red Sauce Pasta (Veg)', price: '460', desc: 'Tangy Arrabiata pasta with vegetables, served with garlic bread.' },
      { name: 'Red Sauce Pasta (Chicken)', price: '520', desc: 'Tangy Arrabiata pasta with chicken, served with garlic bread.' },
    ],
  },
  {
    id: 'asian',
    title: 'Asian Kitchen',
    subtitle: 'Lunch / Dinner',
    icon: Fish,
    color: 'from-teal-800 to-cyan-900',
    items: [
      { name: 'Hot & Sour Soup (Veg)', price: '220', desc: 'Classic hot and sour soup.' },
      { name: 'Hot & Sour Soup (Non-Veg)', price: '260', desc: 'Classic hot and sour soup with chicken.' },
      { name: 'Manchow Soup (Veg)', price: '220', desc: 'Vegetable soup with crispy noodles.' },
      { name: 'Manchow Soup (Non-Veg)', price: '260', desc: 'Chicken soup with crispy noodles.' },
      { name: 'Crispy Honey Chilli Potato', price: '280', desc: 'Crispy fried potatoes tossed in honey chilli sauce.' },
      { name: 'Chilli Paneer', price: '320', desc: 'Paneer tossed in spicy chilli sauce.' },
      { name: 'Chilli Mushroom', price: '300', desc: 'Mushrooms tossed in spicy chilli sauce.' },
      { name: 'Chilli Chicken', price: '340', desc: 'Chicken tossed in spicy chilli sauce.' },
      { name: 'Veg Manchurian (Dry)', price: '280', desc: 'Fried vegetable balls in Manchurian sauce.' },
      { name: 'Veg Manchurian (Gravy)', price: '330', desc: 'Fried vegetable balls in Manchurian gravy.' },
      { name: 'Hakka Noodles (Veg)', price: '260', desc: 'Stir-fried noodles with vegetables.' },
      { name: 'Hakka Noodles (Non-Veg)', price: '340', desc: 'Stir-fried noodles with chicken.' },
      { name: 'Burnt Garlic Noodles (Veg)', price: '260', desc: 'Noodles with burnt garlic and vegetables.' },
      { name: 'Burnt Garlic Noodles (Non-Veg)', price: '340', desc: 'Noodles with burnt garlic and chicken.' },
      { name: 'Fried Rice (Veg)', price: '260', desc: 'Wok-tossed vegetable fried rice.' },
      { name: 'Fried Rice (Chicken)', price: '340', desc: 'Wok-tossed chicken fried rice.' },
      { name: 'Light Ramen Bowl (Veg)', price: '320', desc: 'Vegetable ramen in flavourful broth.' },
      { name: 'Light Ramen Bowl (Non-Veg)', price: '440', desc: 'Chicken ramen in flavourful broth.' },
      { name: 'Thai Red Curry with Rice (Veg)', price: '430', desc: 'Vegetables in aromatic red coconut curry.' },
      { name: 'Thai Red Curry with Rice (Non-Veg)', price: '540', desc: 'Chicken in aromatic red coconut curry.' },
      { name: 'Thai Green Curry with Rice (Veg)', price: '430', desc: 'Vegetables in aromatic green coconut curry.' },
      { name: 'Thai Green Curry with Rice (Non-Veg)', price: '540', desc: 'Chicken in aromatic green coconut curry.' },
    ],
  },
  {
    id: 'desserts',
    title: 'Desserts',
    subtitle: 'All Day',
    icon: IceCream,
    color: 'from-rose-700 to-pink-800',
    items: [
      { name: 'Gulab Jamun', price: '180', desc: 'Soft milk dumplings soaked in rose-scented sugar syrup.' },
      { name: 'Halwa (Atta / Suji / Carrot)', price: '220', desc: 'Warm semolina or carrot halwa, seasonal.' },
      { name: 'Sweet Saffron Rice', price: '220', desc: 'Fragrant rice pudding with saffron and nuts.' },
      { name: 'Kheer', price: '180', desc: 'Creamy rice pudding with cardamom.' },
      { name: 'Choice of Ice-Cream', price: '160', desc: 'Your favourite ice-cream to end the meal.' },
    ],
  },
  {
    id: 'beverages',
    title: 'Beverages',
    subtitle: 'All Day',
    icon: CupSoda,
    color: 'from-emerald-800 to-teal-800',
    items: [
      { name: 'Lemon Honey Ginger Tea', price: '140', desc: 'Soothing infusion of lemon, honey and ginger.' },
      { name: 'Milk Tea (Plain/Masala/Cardamom/Ginger)', price: '140', desc: 'Classic Indian tea with your choice of flavouring.' },
      { name: 'Black Tea', price: '120', desc: 'Pure brewed black tea.' },
      { name: 'Tulsi Herbal Tea', price: '120', desc: 'Holy basil herbal infusion.' },
      { name: 'Sunrise Saffron Milk', price: '160', desc: 'Warm saffron-infused milk.' },
      { name: 'Hot Coffee (with milk / black)', price: '160', desc: 'Fresh brewed coffee.' },
      { name: 'Filter Coffee', price: '180', desc: 'South Indian style filter coffee.' },
      { name: 'Hot Chocolate', price: '220', desc: 'Rich and creamy hot chocolate.' },
      { name: 'Classic Cold Coffee', price: '200', desc: 'Chilled coffee perfection.' },
      { name: 'Fresh Seasonal Juice', price: '180', desc: 'Freshly squeezed seasonal fruit juice.' },
      { name: 'Lassi (Sweet / Salted)', price: '160', desc: 'Traditional yogurt drink.' },
      { name: 'Fresh Lime Soda (Sweet / Salted)', price: '140', desc: 'Refreshing lime soda.' },
      { name: 'Mojito (Classic / Mint / Lemon)', price: '180', desc: 'Refreshing mint mojito.' },
    ],
  },
  {
    id: 'bites',
    title: 'Anytime Bites',
    subtitle: 'All Day',
    icon: Cookie,
    color: 'from-orange-600 to-red-700',
    items: [
      { name: 'Pahado Wali Maggi (Veg)', price: '120', desc: 'Classic mountain-style Maggi noodles.' },
      { name: 'Pahado Wali Maggi (Egg)', price: '140', desc: 'Mountain-style Maggi with egg.' },
      { name: 'Pahado Wali Maggi (Chicken)', price: '180', desc: 'Mountain-style Maggi with chicken.' },
      { name: 'Crispy Corn', price: '220', desc: 'Crunchy fried corn with spices.' },
      { name: 'French Fries', price: '160', desc: 'Golden crispy fries.' },
      { name: 'Mixed Pakodas', price: '220', desc: 'Mix of Onion, Gobi, Aloo etc.' },
      { name: 'Siddu (served with Desi Ghee)', price: '250', desc: 'Traditional Himachali steamed bread.' },
      { name: 'Loaded Nachos', price: '220', desc: 'Nachos with cheese and toppings.' },
      { name: 'Green Salad', price: '120', desc: 'Fresh garden salad.' },
      { name: 'Chicken Popcorn', price: '190', desc: 'Crispy chicken bites.' },
      { name: 'Paneer Tawa Fry', price: '280', desc: 'Pan-seared cottage cheese with spices.' },
      { name: 'Peanut Masala', price: '150', desc: 'Spiced roasted peanuts.' },
      { name: 'Cheese Potato Balls', price: '160', desc: 'Crispy cheese-stuffed potato balls.' },
    ],
  },
  {
    id: 'kids',
    title: 'Kids Special',
    subtitle: 'All Day',
    icon: Baby,
    color: 'from-violet-600 to-purple-700',
    items: [
      { name: 'Bournvita', price: '140', desc: 'Warm chocolate malt drink.' },
      { name: 'Hot Milk', price: '140', desc: 'Warm milk.' },
      { name: 'Pink Flamingo Milk', price: '160', desc: 'Fun strawberry-flavoured milk.' },
      { name: 'Seasonal Milkshakes', price: '180', desc: 'Fresh fruit milkshake.' },
      { name: 'Mini Hot Chocolate with Marshmallow', price: '180', desc: 'Kid-sized hot chocolate with marshmallows.' },
      { name: 'Chocos / Cornflakes with Milk', price: '140', desc: 'Classic cereal bowl.' },
    ],
    note: 'Add-ons: Honey 20 | Almond Milk 80 | Extra Espresso Shot 60 | Hazelnut 60',
  },
];

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
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'table' | 'cottage'>('table');
  const [tableCottageInput, setTableCottageInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [itemIdMap, setItemIdMap] = useState<Record<string, string>>({});

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
    endpoints.cafe.menu().then((res: any) => {
      const cats = res?.data || res?.categories || [];
      const map: Record<string, string> = {};
      cats.forEach((cat: any) => {
        (cat.items || []).forEach((item: any) => {
          const key = item.name.toLowerCase().trim();
          if (!map[key]) map[key] = item.id;
        });
      });
      setItemIdMap(map);
    }).catch(() => {});
  }, []);

  const activeCategoryData = menuData.find(c => c.id === activeCategory);

  const getFilteredItems = () => {
    if (!searchQuery) {
      return { type: 'category' as const, items: activeCategoryData?.items || [] };
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{ item: MenuItem; categoryId: string; categoryTitle: string; idx: number }> = [];
    menuData.forEach(cat => {
      cat.items.forEach((item, idx) => {
        if (item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)) {
          results.push({ item, categoryId: cat.id, categoryTitle: cat.title, idx });
        }
      });
    });
    return { type: 'search' as const, items: results };
  };

  const filteredItems = getFilteredItems();

  const handleAddToCart = (item: MenuItem, localId: string) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price;
    addItem({ itemId: localId, name: item.name, price });
    showNotification(item.name);
  };

  const getApiItemId = (itemName: string): string => {
    const key = itemName.toLowerCase().trim();
    return itemIdMap[key] || '';
  };

  const handlePlaceOrder = async () => {
    if (!tableCottageInput.trim()) return;
    if (cartItems.length === 0) return;
    if (cartItems.some(i => !getApiItemId(i.name))) {
      alert('Some items could not be identified. Please refresh the page and try again.');
      return;
    }
    setOrdering(true);
    try {
      const seatLabel = orderType === 'table' ? `Table ${tableCottageInput.trim()}` : `Cottage ${tableCottageInput.trim()}`;
      const res = await endpoints.cafe.createOrder({
        tableNumber: orderType === 'table' ? parseInt(tableCottageInput) || 1 : 99,
        guestName: guestName.trim() ? `${guestName.trim()} (${seatLabel})` : seatLabel,
        items: cartItems.map(i => ({ itemId: getApiItemId(i.name), quantity: i.quantity })),
      });
      const data = res?.data || res;
      setOrderSuccess(data.orderRef || 'Order placed');
      clearCart();
      setShowCheckout(false);
      setTableCottageInput('');
      setGuestName('');
    } catch {
      alert('Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const ActiveIcon = activeCategoryData?.icon || Coffee;

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-hidden">
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
                Café Charade
              </h1>
              <p className="text-white text-lg md:text-xl max-w-2xl mx-auto font-light drop-shadow-lg">
                A Himalayan culinary journey, from mountain mornings to starlit dinners
              </p>
            </motion.div>
          </div>
        </section>

        <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm" aria-label="Menu categories">
          <div className="vintage-container">
            <div className="flex items-center gap-3 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Link href="/" className="shrink-0 p-2 -ml-2 text-gray-400 hover:text-vedara-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vedara-900/20 focus:border-vedara-900"
                />
              </div>
            </div>
            <div className="flex gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {menuData.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-vedara-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="vintage-container pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-vedara-900" />
              <span><strong className="text-gray-900">Breakfast:</strong> 7:30 AM - 10:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-vedara-900" />
              <span><strong className="text-gray-900">Lunch:</strong> 12:00 PM - 3:30 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-vedara-900" />
              <span><strong className="text-gray-900">Dinner:</strong> 7:00 PM - 10:00 PM</span>
            </div>
          </div>
        </div>

        <div className="vintage-container py-8 md:py-12 pb-28">
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
                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">
                      Search Results
                    </h2>
                    <p className="text-sm text-gray-500">
                      {filteredItems.items.length} result{filteredItems.items.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo; across all categories
                    </p>
                  </div>

                  {Object.entries(
                    filteredItems.items.reduce((acc, item) => {
                      const key = item.categoryId;
                      if (!acc[key]) {
                        acc[key] = { title: item.categoryTitle, items: [] as Array<{ item: MenuItem; categoryId: string; categoryTitle: string; idx: number }> };
                      }
                      acc[key].items.push(item);
                      return acc;
                    }, {} as Record<string, { title: string; items: Array<{ item: MenuItem; categoryId: string; categoryTitle: string; idx: number }> }>)
                  ).map(([categoryId, { title, items }]) => (
                    <div key={categoryId} className="mb-12">
                      <h3 className="font-serif text-2xl text-gray-900 mb-6 pb-2 border-b border-gray-200">
                        {title}
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {items.map(({ item, idx }) => {
                          const localId = `${categoryId}-${idx}`;
                          const isFlipped = flippedIds[localId];
                          const cartItem = cartItems.find(ci => ci.name === item.name);
                          const qty = cartItem?.quantity || 0;
                          return (
                            <TiltCard key={localId} className="group perspective-[1000px] h-auto min-h-[208px]">
                              <motion.div
                                className="relative w-full h-full cursor-pointer"
                                style={{ transformStyle: 'preserve-3d' }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                onClick={() => toggleFlip(localId)}
                              >
                                <div
                                  className="absolute inset-0 bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between"
                                  style={{ backfaceVisibility: 'hidden' }}
                                >
                                  <div>
                                    <h3 className="font-serif text-base text-gray-900 leading-snug mb-1.5">{item.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-vedara-900">₹{item.price}</span>
                                    <span className="text-[10px] text-gray-400">Tap to flip</span>
                                  </div>
                                </div>

                                <div
                                  className="absolute inset-0 bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between"
                                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                  <div>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      <span className="text-sm font-semibold text-vedara-900">₹{item.price}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {qty > 0 ? (
                                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                                        <button
                                          onClick={() => { if (qty === 1) removeItem(cartItem!.itemId); else updateQuantity(cartItem!.itemId, qty - 1); }}
                                          className="w-6 h-6 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900 min-w-[20px] text-center">{qty}</span>
                                        <button
                                          onClick={() => handleAddToCart(item, localId)}
                                          className="w-6 h-6 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAddToCart(item, localId)}
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
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400">No items found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-vedara-900 text-white text-sm font-medium mb-4 shadow-md">
                      <ActiveIcon className="w-4 h-4" />
                      {activeCategoryData?.subtitle}
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">
                      {activeCategoryData?.title}
                    </h2>
                  </div>

                  {activeCategoryData?.note && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-4 mb-8 text-sm text-gray-600 bg-amber-50 border border-amber-200"
                    >
                      <Leaf className="w-4 h-4 text-amber-600 inline-block mr-1.5 -mt-0.5" />
                      {activeCategoryData.note}
                    </motion.div>
                  )}

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {(filteredItems.type === 'category' ? filteredItems.items : []).map((item, idx) => {
                      const localId = `${activeCategory}-${idx}`;
                      const isFlipped = flippedIds[localId];
                      const cartItem = cartItems.find(ci => ci.name === item.name);
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
                              className="absolute inset-0 bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <div>
                                <h3 className="font-serif text-base text-gray-900 leading-snug mb-1.5">{item.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-vedara-900">₹{item.price}</span>
                                <span className="text-[10px] text-gray-400">Tap to flip</span>
                              </div>
                            </div>

                            <div
                              className="absolute inset-0 bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between"
                              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                              <div>
                                <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span className="text-sm font-semibold text-vedara-900">₹{item.price}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                {qty > 0 ? (
                                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                                    <button
                                      onClick={() => { if (qty === 1) removeItem(cartItem!.itemId); else updateQuantity(cartItem!.itemId, qty - 1); }}
                                      className="w-6 h-6 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-semibold text-gray-900 min-w-[20px] text-center">{qty}</span>
                                    <button
                                      onClick={() => handleAddToCart(item, localId)}
                                      className="w-6 h-6 rounded-full bg-vedara-900 text-white flex items-center justify-center hover:bg-vedara-900/80 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(item, localId)}
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
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400">No items found</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-xl inline-block px-8 py-6">
              <Mountain className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 max-w-md">
                All prices are in INR and include applicable taxes. Pre-orders for select items require 24-hour notice.
                For special dietary requirements, please inform our staff. Café Charade does not serve alcoholic beverages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOrderSuccess(null)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white p-8 text-center max-w-sm mx-4 rounded-2xl shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-serif text-xl text-gray-900 mb-2">Order Placed!</h3>
            <p className="text-sm text-gray-500 mb-1">Reference: {orderSuccess}</p>
            <p className="text-xs text-gray-400 mb-6">Your order has been sent to the kitchen.</p>
            <button
              onClick={() => setOrderSuccess(null)}
              className="px-6 py-2 rounded-full bg-vedara-900 text-white text-sm font-medium hover:bg-vedara-900/80 transition-colors"
            >
              Continue Browsing
            </button>
          </motion.div>
        </div>
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
            className="text-xs font-semibold bg-white text-vedara-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
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
            className="bg-white p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
          >
            <h3 className="font-serif text-xl text-gray-900 mb-4">Place Your Order</h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setOrderType('table')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  orderType === 'table' ? 'bg-vedara-900 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Store className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setOrderType('cottage')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  orderType === 'cottage' ? 'bg-vedara-900 text-white shadow-md' : 'bg-gray-100 text-gray-600'
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
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vedara-900/20 focus:border-vedara-900"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs text-muted-foreground mb-1.5">Your Name (optional)</label>
              <input
                type="text"
                placeholder="Your name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vedara-900/20 focus:border-vedara-900"
              />
            </div>

            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {cartItems.map(ci => (
                <div key={ci.itemId} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{ci.name}</p>
                    <p className="text-xs text-muted-foreground">×{ci.quantity} x ₹{ci.price * ci.quantity}</p>
                  </div>
                  <button onClick={() => removeItem(ci.itemId)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 mb-6">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-vedara-900">₹{total()}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCheckout(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors">
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
