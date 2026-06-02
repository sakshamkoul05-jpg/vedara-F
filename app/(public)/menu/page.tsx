'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Coffee, Soup, Fish, Salad, UtensilsCrossed, IceCream, CupSoda, Pizza, Baby, Sparkles, Mountain, Leaf, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';

type MenuItem = {
  name: string;
  price: string;
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
    subtitle: '7AM - 11AM',
    icon: Coffee,
    color: 'from-amber-600 to-yellow-700',
    items: [
      { name: 'Himachali Paratha Breakfast', price: '280', desc: 'Freshly prepared traditional North Indian stuffed flatbread. Choice of Aloo, Gobhi or Paneer Paratha. Served with local butter, fresh curd, traditional Himachali pickle & seasonal fruits.' },
      { name: 'Farm Egg Breakfast', price: '280', desc: 'Farm fresh eggs cooked to your preference. Choice of Sunny Side Up, Plain/Masala Omelette or scrambled eggs. Served with toast, butter/jam, roasted potatoes & seasonal fruits.' },
      { name: 'Cinnamon French Toast', price: '280', desc: 'Golden pan-grilled French toast infused with cinnamon and vanilla. Served with fresh seasonal fruits, honey and chocolate syrup.' },
      { name: 'Pancake Breakfast', price: '295', desc: 'Freshly made homemade fluffy pancakes. Served with fresh seasonal fruits, honey and chocolate syrup.' },
      { name: 'Vedara Breakfast Sandwich', price: '295', desc: 'A wholesome toasted sandwich. Choice of Egg & Cheese, Egg Chicken & Cheese, Paneer Corn & Cheese, or Mushroom Corn & Cheese. Served with grilled vegetables, sausages & seasonal fruits.' },
      { name: 'Himalayan Smoothie Bowl', price: '320', desc: 'Refreshing breakfast bowl. Choice of Banana Peanut Butter, Mixed Berry, or Mango Coconut (seasonal). Topped with granola, fresh fruits, nuts & seeds.' },
      { name: 'English Breakfast Platter', price: '375', desc: 'Hearty platter with eggs cooked to preference, toast with butter/jam, sautéed vegetables, baked beans & chicken sausages.' },
      { name: 'Puri Bhaji', price: '245', desc: 'Fluffy golden puris served with slow-cooked Himachali style aloo bhaji, traditional pickle & fresh curd.' },
    ],
    note: 'Choose one beverage with breakfast: Milk Tea, Black Tea, Fresh Brewed Coffee, or Lemon Honey Ginger Tea. Add-ons: Fresh fruit bowl ₹130 | Extra toast ₹80 | Hash brown ₹120',
  },
  {
    id: 'himachali',
    title: 'Himachali Specials',
    subtitle: 'Lunch / Dinner - Pre-order',
    icon: Mountain,
    color: 'from-forest-700 to-earth-700',
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
    note: 'Breads: Tawa Roti (Plain/Butter) ₹30/50 | Plain Paratha ₹90 | Steamed Rice ₹160 | Jeera Rice ₹210 | Vegetable Pulao ₹240',
  },
  {
    id: 'continental',
    title: 'Continental',
    subtitle: 'Lunch / Dinner',
    icon: UtensilsCrossed,
    color: 'from-stone-700 to-amber-900',
    items: [
      { name: 'Rosemary Roasted Paneer', price: '540', desc: 'Paneer with mashed potatoes and sautéed veggies.' },
      { name: 'Rosemary Roasted Chicken', price: '620', desc: 'Roasted chicken with mashed potatoes and sautéed veggies.' },
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
    icon: Pizza,
    color: 'from-orange-600 to-red-700',
    items: [
      { name: 'Pahado Wali Maggi (Veg)', price: '120', desc: 'Classic mountain-style Maggi noodles.' },
      { name: 'Pahado Wali Maggi (Egg)', price: '140', desc: 'Mountain-style Maggi with egg.' },
      { name: 'Pahado Wali Maggi (Chicken)', price: '180', desc: 'Mountain-style Maggi with chicken.' },
      { name: 'Crispy Corn', price: '220', desc: 'Crunchy fried corn with spices.' },
      { name: 'French Fries', price: '160', desc: 'Golden crispy fries.' },
      { name: 'Pakoda', price: '220', desc: 'Crispy onion fritters.' },
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
    note: 'Add-ons: Honey ₹20 | Almond Milk ₹80 | Extra Espresso Shot ₹60 | Hazelnut ₹60',
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
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent 60%)',
        }}
      />
    </motion.div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const bgRotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { stiffness: 100, damping: 30 });
  const bgRotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  const activeCategoryData = menuData.find(c => c.id === activeCategory);
  const filteredItems = activeCategoryData?.items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 dark:bg-earth-950 overflow-hidden">
      <motion.div
        style={{ rotateX: bgRotateX, rotateY: bgRotateY }}
        className="fixed inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-forest-200/20 dark:bg-forest-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-200/20 dark:bg-amber-800/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10">
        <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80)', transform: 'scale(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-cream-50 dark:to-earth-950" />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-sans">The Vedara Retreat</p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-cream-50 mb-4 tracking-wide">
                Café Charade
              </h1>
              <p className="text-cream-200/80 text-lg md:text-xl max-w-2xl mx-auto font-light">
                A Himalayan culinary journey — from mountain mornings to starlit dinners
              </p>
            </motion.div>
          </div>
        </div>

        <div className="sticky top-0 z-30 bg-cream-50/80 dark:bg-earth-950/80 backdrop-blur-xl border-b border-earth-200/50 dark:border-earth-800/50">
          <div className="vintage-container">
            <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-none">
              <Link href="/" className="shrink-0 p-2 - ml-2 text-earth-500 hover:text-earth-700 dark:hover:text-earth-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-earth-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-earth-100 dark:bg-earth-800 border-0 text-foreground placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
            </div>
            <div className="flex gap-1 pb-3 overflow-x-auto scrollbar-none">
              {menuData.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-forest-700 text-cream-50 shadow-lg shadow-forest-900/20'
                      : 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-700'
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vintage-container py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${activeCategoryData?.color} text-cream-50 text-xs font-medium mb-4 shadow-lg`}>
                  {activeCategoryData && <activeCategoryData.icon className="w-3.5 h-3.5" />}
                  {activeCategoryData?.subtitle}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
                  {activeCategoryData?.title}
                </h2>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>

              {activeCategoryData?.note && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="vintage-card p-4 mb-8 text-sm text-muted-foreground bg-earth-100/50 dark:bg-earth-800/30 border border-earth-200/50 dark:border-earth-700/50"
                >
                  <Leaf className="w-4 h-4 text-forest-500 inline-block mr-1.5 -mt-0.5" />
                  {activeCategoryData.note}
                </motion.div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map((item, idx) => {
                  const isFlipped = flippedId === `${activeCategory}-${idx}`;
                  return (
                    <TiltCard key={`${activeCategory}-${idx}`} className="group perspective-[1000px] h-48">
                      <motion.div
                        className="relative w-full h-full cursor-pointer"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                        onClick={() => setFlippedId(isFlipped ? null : `${activeCategory}-${idx}`)}
                      >
                        <div
                          className="absolute inset-0 vintage-card p-5 flex flex-col justify-between backface-hidden"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div>
                            <h3 className="font-serif text-base text-foreground leading-snug mb-1.5">{item.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-forest-600 dark:text-forest-400">₹{item.price}</span>
                            <span className="text-[10px] text-earth-400">Tap to flip</span>
                          </div>
                        </div>

                        <div
                          className="absolute inset-0 vintage-card p-5 flex flex-col justify-center backface-hidden"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-sm font-semibold text-forest-600 dark:text-forest-400">₹{item.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    </TiltCard>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-20">
                  <Search className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No items found for &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 text-center">
            <div className="vintage-card inline-block px-8 py-6">
              <Mountain className="w-5 h-5 text-forest-500 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground max-w-md">
                All prices are in INR and include applicable taxes. Pre-orders for select items require 24-hour notice.
                For special dietary requirements, please inform our staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
