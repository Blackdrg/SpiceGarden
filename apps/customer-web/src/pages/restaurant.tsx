import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../redux/slices/cartSlice';
import { RootState } from '../redux/store';
import {
  ChevronLeft,
  Star,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import styles from './index.module.css';

interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: string;
  rating: number;
  reviewsCount: string;
  isVeg: boolean;
  isBestseller?: boolean;
  image: string;
}

const RESTAURANTS_DATA: Record<string, {
  name: string;
  cuisine: string;
  rating: number;
  reviewsCount: string;
  deliveryTime: number;
  address: string;
  discount: string;
  coverImage: string;
  categories: string[];
  dishes: MenuItem[];
}> = {
  'rest-001': {
    name: 'SpiceGarden Signature Kitchen',
    cuisine: 'Awadhi & Mughlai • Biryani • Kebabs',
    rating: 4.9,
    reviewsCount: '2.4k+',
    deliveryTime: 22,
    address: 'Plot 12, Gourmet Court, Sector 17, Chandigarh',
    discount: '50% OFF UPTO ₹150',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    categories: ['Chef Specials', 'Handi Biryani', 'Makhani Curries', 'Tandoor Breads', 'Royal Desserts'],
    dishes: [
      {
        id: 'sg-1',
        name: 'Special Handi Chicken Biryani',
        desc: 'Slow cooked in clay pot with aged basmati rice, tender chicken, saffron milk and whole spices.',
        price: 320,
        category: 'Handi Biryani',
        rating: 4.9,
        reviewsCount: '1.2k+',
        isVeg: false,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sg-2',
        name: 'Mughlai Butter Chicken Boneless',
        desc: 'Charcoal grilled chicken tikka simmered in creamy velvety tomato, butter & cashew gravy.',
        price: 290,
        category: 'Makhani Curries',
        rating: 4.9,
        reviewsCount: '890+',
        isVeg: false,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sg-3',
        name: 'Dal Makhani Slow-Simmered',
        desc: 'Overnight slow cooked whole black lentils finished with fresh cream and churned white butter.',
        price: 220,
        category: 'Makhani Curries',
        rating: 4.8,
        reviewsCount: '710+',
        isVeg: true,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sg-4',
        name: 'Garlic Butter Naan (Clay Oven)',
        desc: 'Traditional clay-tandoor baked soft flatbread infused with roasted garlic and fresh cilantro.',
        price: 65,
        category: 'Tandoor Breads',
        rating: 4.9,
        reviewsCount: '2.1k+',
        isVeg: true,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sg-5',
        name: 'Kesar Pista Rasmalai Bowl (2 pcs)',
        desc: 'Soft melt-in-mouth cottage cheese patties soaked in chilled saffron cardamom infused clotted milk.',
        price: 130,
        category: 'Royal Desserts',
        rating: 4.9,
        reviewsCount: '950+',
        isVeg: true,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sg-6',
        name: 'Smoked Chicken Galouti Kebab (4 pcs)',
        desc: 'Royal Lucknowi minced chicken patties infused with 24 aromatic spices and smoked with cloves.',
        price: 340,
        category: 'Chef Specials',
        rating: 4.9,
        reviewsCount: '480+',
        isVeg: false,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },
};

export default function RestaurantPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const restId = (router.query.id as string) || 'rest-001';
  const restaurant = RESTAURANTS_DATA[restId] || RESTAURANTS_DATA['rest-001'];

  const [activeCategory, setActiveCategory] = useState(restaurant.categories[0] || 'Handi Biryani');
  const [vegOnly, setVegOnly] = useState(false);
  const [customizingDish, setCustomizingDish] = useState<MenuItem | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');
  const [extraRaita, setExtraRaita] = useState(false);

  const filteredDishes = restaurant.dishes.filter((d) => {
    if (vegOnly && !d.isVeg) return false;
    if (activeCategory !== 'All' && d.category !== activeCategory) return false;
    return true;
  });

  const getItemQty = (id: string) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  const handleAddDirect = (dish: MenuItem) => {
    dispatch(
      addToCart({
        item: {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
        },
        restaurantId: restId,
      })
    );
  };

  const handleAddCustomized = () => {
    if (!customizingDish) return;
    const finalPrice = customizingDish.price + (extraRaita ? 30 : 0);
    const customizedName = `${customizingDish.name} (${spiceLevel}${extraRaita ? ' + Raita' : ''})`;
    dispatch(
      addToCart({
        item: {
          id: customizingDish.id,
          name: customizedName,
          price: finalPrice,
          quantity: 1,
        },
        restaurantId: restId,
      })
    );
    setCustomizingDish(null);
  };

  const handleIncrement = (dish: MenuItem) => {
    const curr = getItemQty(dish.id);
    dispatch(updateQuantity({ id: dish.id, quantity: curr + 1 }));
  };

  const handleDecrement = (dish: MenuItem) => {
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
        <title>{restaurant.name} | SpiceGarden Menu</title>
      </Head>

      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={16} /> FSSAI Certified Gourmet
        </span>
      </div>

      {/* Restaurant Hero Card */}
      <div
        style={{
          background: '#FFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          marginBottom: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ position: 'relative', height: 180 }}>
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(15,23,42,0.85)',
              backdropFilter: 'blur(8px)',
              color: '#FFF',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Tag size={14} color="#FB923C" /> {restaurant.discount}
          </div>
        </div>

        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>{restaurant.name}</h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#FEF3C7',
                color: '#B45309',
                padding: '4px 8px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              <Star size={14} fill="#B45309" /> {restaurant.rating} ({restaurant.reviewsCount})
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 10px 0' }}>{restaurant.cuisine}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#475569', borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color="#FF5A1F" /> {restaurant.deliveryTime} mins Delivery
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} color="#64748B" /> Sector 17, Chandigarh
            </span>
          </div>
        </div>
      </div>

      {/* Dietary Switch & Categories Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setVegOnly((prev) => !prev)}
          style={{
            padding: '8px 16px',
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

        {restaurant.categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: activeCategory === cat ? '1.5px solid #FF5A1F' : '1px solid #E2E8F0',
              background: activeCategory === cat ? '#FFF7ED' : '#FFF',
              color: activeCategory === cat ? '#EA580C' : '#64748B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Dishes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 90 }}>
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
                  {dish.isBestseller && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: 4 }}>
                      ⭐ BESTSELLER
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>{dish.name}</h3>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>₹{dish.price}</p>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.4 }}>{dish.desc}</p>

                <button
                  type="button"
                  onClick={() => setCustomizingDish(dish)}
                  style={{ background: 'none', border: 'none', color: '#FF5A1F', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <SlidersHorizontal size={13} /> Customize
                </button>
              </div>

              {/* Photo & Quantity Selector */}
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
                      onClick={() => handleAddDirect(dish)}
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

      {/* Dish Customization Modal */}
      {customizingDish && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#FFF', borderRadius: 20, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Customize {customizingDish.name}</h3>
              <button
                type="button"
                onClick={() => setCustomizingDish(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Base Price: ₹{customizingDish.price}</p>

            {/* Spice Level */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Spice Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Mild', 'Medium', 'Spicy'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: spiceLevel === level ? '1.5px solid #FF5A1F' : '1px solid #CBD5E1',
                      background: spiceLevel === level ? '#FFF7ED' : '#F8FAFC',
                      color: spiceLevel === level ? '#EA580C' : '#475569',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Add-on */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Optional Add-ons</label>
              <div
                onClick={() => setExtraRaita((prev) => !prev)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 10,
                  border: extraRaita ? '1.5px solid #FF5A1F' : '1px solid #E2E8F0',
                  background: extraRaita ? '#FFF7ED' : '#FFF',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Boondi &amp; Mint Raita Bowl</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EA580C' }}>+₹30</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCustomized}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                background: '#FF5A1F',
                color: '#FFF',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,90,31,0.3)',
              }}
            >
              Add to Cart • ₹{customizingDish.price + (extraRaita ? 30 : 0)}
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: 16,
            right: 16,
            maxWidth: 600,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: '#FFF',
            padding: '14px 20px',
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 25px rgba(15,23,42,0.35)',
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
            <span>Proceed to Cart</span>
            <ArrowRight size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
