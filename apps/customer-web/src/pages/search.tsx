import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../redux/slices/cartSlice';
import { RootState } from '../redux/store';
import {
  Search,
  ChevronLeft,
  Star,
  Clock,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import styles from './index.module.css';

interface SearchDish {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: string;
  rating: number;
  reviewsCount: string;
  restaurantName: string;
  restaurantId: string;
  time: number;
  isVeg: boolean;
  image: string;
}

const SEARCH_DISHES: SearchDish[] = [
  {
    id: 'dish-1',
    name: 'Special Dum Chicken Biryani Bowl',
    desc: 'Slow-cooked in sealed handi with basmati rice, saffron, and tender chicken thighs.',
    price: 299,
    category: 'Biryani',
    rating: 4.9,
    reviewsCount: '840+',
    restaurantName: 'SpiceGarden Signature Kitchen',
    restaurantId: 'rest-001',
    time: 20,
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-2',
    name: 'Creamy Butter Chicken & Garlic Naan Combo',
    desc: 'Tender tandoori chicken simmered in rich velvety tomato cashew gravy with hot naan.',
    price: 349,
    category: 'North Indian',
    rating: 4.9,
    reviewsCount: '1.2k+',
    restaurantName: 'SpiceGarden Signature Kitchen',
    restaurantId: 'rest-001',
    time: 22,
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-3',
    name: 'Shahi Paneer Tikka Masala',
    desc: 'Charcoal-grilled cottage cheese cubes cooked in rich aromatic spiced makhani gravy.',
    price: 260,
    category: 'North Indian',
    rating: 4.8,
    reviewsCount: '620+',
    restaurantName: 'Punjab Grill & Curry House',
    restaurantId: 'rest-002',
    time: 18,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-4',
    name: 'Artisan Burrata Truffle Pizza',
    desc: '48-hour fermented sourdough crust topped with San Marzano tomatoes, fresh burrata & truffle oil.',
    price: 499,
    category: 'Pizza',
    rating: 4.8,
    reviewsCount: '450+',
    restaurantName: 'Artisan Woodfired Pizzeria',
    restaurantId: 'rest-003',
    time: 25,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-5',
    name: 'Avocado & Quinoa Power Salad',
    desc: 'Hass avocados, organic tri-color quinoa, cherry tomatoes, and honey mustard dressing.',
    price: 290,
    category: 'Healthy',
    rating: 4.7,
    reviewsCount: '310+',
    restaurantName: 'The Green Bowl & Salads',
    restaurantId: 'rest-004',
    time: 15,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-6',
    name: 'Double Truffle Smash Burger',
    desc: 'Two juicy smash patties, aged cheddar, caramelized onions, and black truffle aioli in brioche.',
    price: 220,
    category: 'Burgers',
    rating: 4.8,
    reviewsCount: '790+',
    restaurantName: 'Burger & Brew Kraft',
    restaurantId: 'rest-005',
    time: 18,
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-7',
    name: 'Kesar Pista Rasmalai Bowl (2 pcs)',
    desc: 'Melt-in-mouth cottage cheese patties soaked in saffron cardamom infused clotted milk.',
    price: 140,
    category: 'Desserts',
    rating: 4.9,
    reviewsCount: '920+',
    restaurantName: 'Royal Mithai & Sweet Treat',
    restaurantId: 'rest-006',
    time: 10,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
  },
];

const CUISINES = ['All', 'Biryani', 'North Indian', 'Pizza', 'Burgers', 'Healthy', 'Desserts'];

export default function SearchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    if (router.query.q && typeof router.query.q === 'string') {
      setSearchTerm(router.query.q);
    }
  }, [router.query.q]);

  const filteredDishes = useMemo(() => {
    return SEARCH_DISHES.filter((dish) => {
      if (vegOnly && !dish.isVeg) return false;
      if (selectedCuisine !== 'All' && dish.category !== selectedCuisine) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = dish.name.toLowerCase().includes(q);
        const matchDesc = dish.desc.toLowerCase().includes(q);
        const matchCat = dish.category.toLowerCase().includes(q);
        const matchRest = dish.restaurantName.toLowerCase().includes(q);
        return matchName || matchDesc || matchCat || matchRest;
      }
      return true;
    });
  }, [searchTerm, selectedCuisine, vegOnly]);

  const getItemQty = (id: string) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  const handleAdd = (dish: SearchDish) => {
    dispatch(
      addToCart({
        item: {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
        },
        restaurantId: dish.restaurantId,
      })
    );
  };

  const handleIncrement = (dish: SearchDish) => {
    const curr = getItemQty(dish.id);
    dispatch(updateQuantity({ id: dish.id, quantity: curr + 1 }));
  };

  const handleDecrement = (dish: SearchDish) => {
    const curr = getItemQty(dish.id);
    if (curr <= 1) {
      dispatch(removeFromCart(dish.id));
    } else {
      dispatch(updateQuantity({ id: dish.id, quantity: curr - 1 }));
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Search Dishes &amp; Cuisines | SpiceGarden</title>
      </Head>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Search for Biryani, Butter Chicken, Pizza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 12,
              border: '1.5px solid #FF5A1F',
              fontSize: 14,
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 2px 8px rgba(255,90,31,0.1)',
            }}
          />
        </div>
      </div>

      {/* Cuisine Chips & Veg Filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setVegOnly((prev) => !prev)}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            border: vegOnly ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
            background: vegOnly ? '#DCFCE7' : '#FFF',
            color: vegOnly ? '#15803D' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap',
          }}
        >
          🌱 Pure Veg
        </button>

        {CUISINES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedCuisine(c)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: selectedCuisine === c ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
              background: selectedCuisine === c ? '#0F172A' : '#FFF',
              color: selectedCuisine === c ? '#FFF' : '#64748B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          {filteredDishes.length} Items Found
        </h2>
        <span style={{ fontSize: 12, color: '#64748B' }}>Real-time Kitchen Availability</span>
      </div>

      {/* Dishes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 80 }}>
        {filteredDishes.map((dish) => {
          const qty = getItemQty(dish.id);
          return (
            <div
              key={dish.id}
              style={{
                background: '#FFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                gap: 16,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: `2px solid ${dish.isVeg ? '#16A34A' : '#DC2626'}`,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: dish.isVeg ? '#16A34A' : '#DC2626' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C' }}>{dish.category}</span>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>{dish.name}</h3>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>₹{dish.price}</p>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.4 }}>{dish.desc}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94A3B8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#B45309', fontWeight: 700 }}>
                    <Star size={12} fill="#B45309" /> {dish.rating} ({dish.reviewsCount})
                  </span>
                  <span>•</span>
                  <span>{dish.restaurantName}</span>
                </div>
              </div>

              {/* Photo & Add Button */}
              <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0, borderRadius: 14, overflow: 'hidden' }}>
                <img
                  src={dish.image}
                  alt={dish.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: '85%' }}>
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAdd(dish)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: '#FFF',
                        border: '1.5px solid #FF5A1F',
                        color: '#FF5A1F',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      ADD +
                    </button>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FF5A1F',
                        borderRadius: 8,
                        padding: '4px 8px',
                        color: '#FFF',
                        boxShadow: '0 2px 6px rgba(255,90,31,0.4)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDecrement(dish)}
                        style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: 12 }}>{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(dish)}
                        style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 76,
            left: 16,
            right: 16,
            maxWidth: 600,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: '#FFF',
            padding: '12px 18px',
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
            zIndex: 90,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/cart')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FF5A1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>₹{cartTotal}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>{cartItems.length} items in cart</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: '#FB923C' }}>
            <span>Checkout</span>
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation */}
      <nav className={styles.nav}>
        <div className={styles.tablist}>
          {[
            { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
            { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
            { key: 'orders', label: 'Orders', Icon: OrderIcon, path: '/history' },
            { key: 'account', label: 'Profile', Icon: ProfileIcon, path: '/profile' },
          ].map((tab) => {
            const Icon = tab.Icon;
            const isActive = tab.key === 'search';
            return (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tab} ${isActive ? styles.activeTab : styles.inactiveTab}`}
                onClick={() => router.push(tab.path)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className={styles.tabIcon}>
                  <Icon size={22} color={isActive ? '#FF5A1F' : '#64748B'} />
                </span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}