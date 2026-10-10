import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  MapPin,
  Search,
  Bell,
  ShoppingBag,
  Star,
  Clock,
  ChevronDown,
  Sparkles,
  Tag,
  ArrowRight,
  Flame,
  ShieldCheck,
  User,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import styles from './index.module.css';

interface RestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewsCount: string;
  deliveryTime: number;
  priceForTwo: number;
  discount: string;
  image: string;
  isVeg: boolean;
  featuredDish: string;
  distance: string;
}

const FEATURED_RESTAURANTS: RestaurantItem[] = [
  {
    id: 'rest-001',
    name: 'SpiceGarden Signature Kitchen',
    cuisine: 'Awadhi & Mughlai • Biryani • Kebabs',
    rating: 4.9,
    reviewsCount: '2.4k+',
    deliveryTime: 22,
    priceForTwo: 550,
    discount: '50% OFF UPTO ₹150',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    featuredDish: 'Dum Handi Biryani & Butter Naan',
    distance: '1.2 km',
  },
  {
    id: 'rest-002',
    name: 'Punjab Grill & Curry House',
    cuisine: 'North Indian • Dal Makhani • Tandoori',
    rating: 4.7,
    reviewsCount: '1.8k+',
    deliveryTime: 28,
    priceForTwo: 450,
    discount: 'FLAT ₹100 OFF',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    featuredDish: 'Murgh Makhani & Garlic Kulcha',
    distance: '2.4 km',
  },
  {
    id: 'rest-003',
    name: 'Artisan Woodfired Pizzeria',
    cuisine: 'Italian • Gourmet Sourdough Pizza • Pasta',
    rating: 4.8,
    reviewsCount: '950+',
    deliveryTime: 25,
    priceForTwo: 600,
    discount: 'BUY 1 GET 1 FREE',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    featuredDish: 'Burrata Truffle Margherita',
    distance: '1.8 km',
  },
  {
    id: 'rest-004',
    name: 'The Green Bowl & Salads',
    cuisine: 'Healthy • Keto Bowls • Fresh Juices',
    rating: 4.6,
    reviewsCount: '620+',
    deliveryTime: 18,
    priceForTwo: 380,
    discount: '20% OFF ALL BOWLS',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    featuredDish: 'Avocado Quinoa Power Bowl',
    distance: '0.9 km',
  },
  {
    id: 'rest-005',
    name: 'Burger & Brew Kraft',
    cuisine: 'Smash Burgers • Loaded Fries • Shakes',
    rating: 4.7,
    reviewsCount: '1.4k+',
    deliveryTime: 20,
    priceForTwo: 400,
    discount: 'FREE FRIES WITH BURGERS',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    featuredDish: 'Double Truffle Smash Burger',
    distance: '1.5 km',
  },
  {
    id: 'rest-006',
    name: 'Royal Mithai & Sweet Treat',
    cuisine: 'Desserts • Gulab Jamun • Rasmalai • Halwa',
    rating: 4.9,
    reviewsCount: '3.1k+',
    deliveryTime: 15,
    priceForTwo: 250,
    discount: 'FLAT ₹50 CASHBACK',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    featuredDish: 'Kesar Pista Rasmalai Bowl',
    distance: '0.7 km',
  },
];

const CATEGORIES = [
  { name: 'Biryani', icon: '🍚', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80' },
  { name: 'North Indian', icon: '🍛', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&auto=format&fit=crop&q=80' },
  { name: 'Pizza', icon: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80' },
  { name: 'Burgers', icon: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
  { name: 'Healthy', icon: '🥗', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80' },
  { name: 'Desserts', icon: '🍨', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80' },
];

export default function HomePage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [location, setLocation] = useState('Sector 17, Chandigarh');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'veg' | 'topRated' | 'fast' | 'offers'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRestaurants = FEATURED_RESTAURANTS.filter((rest) => {
    if (selectedCategory && !rest.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) && !rest.name.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }
    if (activeFilter === 'veg' && !rest.isVeg) return false;
    if (activeFilter === 'topRated' && rest.rating < 4.8) return false;
    if (activeFilter === 'fast' && rest.deliveryTime > 22) return false;
    if (activeFilter === 'offers' && !rest.discount) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>SpiceGarden | Gourmet Food Delivery</title>
      </Head>

      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.brandLocationGroup}>
          <div className={styles.brandBadge}>
            <Flame size={22} color="#FF5A1F" />
            <span>SpiceGarden</span>
          </div>
          <button
            type="button"
            className={styles.deliveryLocation}
            onClick={() => setShowLocationModal(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <MapPin size={16} color="#FF5A1F" />
            <span style={{ fontWeight: 600 }}>{location}</span>
            <ChevronDown size={14} />
          </button>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => router.push('/notifications')}
            aria-label="View notifications"
          >
            <Bell size={18} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              aria-label="Profile menu"
              style={{ background: '#FFF7ED', borderColor: '#FED7AA', color: '#EA580C', fontWeight: 800 }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </button>

            {showProfileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 50,
                  width: 240,
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: '1px solid #E2E8F0',
                  padding: 12,
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{user?.fullName || 'Arjun Mehta'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>{user?.email || 'arjun@spicegarden.com'}</p>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155' }}
                  onClick={() => { setShowProfileDropdown(false); router.push('/wallet'); }}
                >
                  <CreditCard size={16} color="#FF5A1F" /> Spice Wallet: ₹500
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155' }}
                  onClick={() => { setShowProfileDropdown(false); router.push('/history'); }}
                >
                  <ShoppingBag size={16} color="#FF5A1F" /> Past Orders &amp; Receipts
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#DC2626', borderTop: '1px solid #F1F5F9', marginTop: 6 }}
                  onClick={() => { setShowProfileDropdown(false); router.push('/profile'); }}
                >
                  <User size={16} /> My Account
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Reactive Search Trigger */}
      <button
        type="button"
        className={styles.searchBar}
        onClick={() => router.push('/search')}
      >
        <span className={styles.searchIcon}>
          <Search size={20} />
        </span>
        <span className={styles.searchText}>Search for Biryani, Butter Chicken, Pizza, Desserts...</span>
      </button>

      {/* Promotional Hero Banner */}
      <div
        className={styles.promoBanner}
        onClick={() => router.push('/offers')}
      >
        <span className={styles.promoTag}>⚡ Festival of Flavors</span>
        <h2 className={styles.promoTitle}>Flat 50% Off On First 3 Orders</h2>
        <p className={styles.promoText}>
          Use coupon code <strong>WELCOME50</strong> at checkout on premium chef specialties.
        </p>
        <div className={styles.promoAction}>
          <span>Claim Offer Now</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Interactive Categories */}
      <div style={{ marginBottom: 24 }}>
        <div className={styles.sectionTitle}>
          <span>What's on your mind?</span>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{ background: 'none', border: 'none', color: '#FF5A1F', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Clear Filter ✕
            </button>
          )}
        </div>

        <div className={styles.categoryContainer}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.name}
                className={styles.categoryItem}
                style={isSelected ? { borderColor: '#FF5A1F', background: '#FFF7ED' } : {}}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Sorting Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
        {[
          { key: 'all' as const, label: 'All Restaurants' },
          { key: 'topRated' as const, label: '⭐ Top Rated 4.8+' },
          { key: 'fast' as const, label: '⚡ Fast Delivery (<22m)' },
          { key: 'veg' as const, label: '🌱 Pure Veg Only' },
          { key: 'offers' as const, label: '🎁 Great Deals' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              border: activeFilter === f.key ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
              background: activeFilter === f.key ? '#0F172A' : '#FFFFFF',
              color: activeFilter === f.key ? '#FFFFFF' : '#475569',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Restaurants Section */}
      <div>
        <div className={styles.sectionTitle}>
          <span>Popular Restaurants ({filteredRestaurants.length})</span>
          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Live &amp; Open Now</span>
        </div>

        <div className={styles.restaurantItemGrid}>
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              className={styles.restaurantCard}
              onClick={() => router.push(`/restaurant?id=${rest.id}`)}
            >
              <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                <img
                  src={rest.image}
                  alt={rest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFF',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Tag size={12} color="#FB923C" /> {rest.discount}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#0F172A',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Clock size={13} color="#FF5A1F" /> {rest.deliveryTime} mins
                </div>
              </div>

              <div className={styles.restaurantContent}>
                <div className={styles.restaurantHeader}>
                  <h3 className={styles.restaurantName}>{rest.name}</h3>
                  <div className={styles.ratingBadge}>
                    <Star size={13} fill="#B45309" />
                    <span>{rest.rating}</span>
                  </div>
                </div>

                <p className={styles.restaurantDescription}>{rest.cuisine}</p>

                <div style={{ fontSize: 12, color: '#ea580c', fontWeight: 600, background: '#FFF7ED', padding: '4px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 4 }}>
                  ✨ Must Try: {rest.featuredDish}
                </div>

                <div className={styles.restaurantMeta}>
                  <span className={styles.metaItem}>📍 {rest.distance} away</span>
                  <span className={styles.metaItem}>•</span>
                  <span className={styles.metaItem}>₹{rest.priceForTwo} for two</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
              <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Plus taxes &amp; delivery</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: '#FB923C' }}>
            <span>View Cart</span>
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#FFF', borderRadius: 20, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Choose Delivery Location</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { title: 'Sector 17, Chandigarh', sub: 'Flat 402, Royal Palms' },
                { title: 'Phase 8, Mohali', sub: 'Tower B, Tech Hub' },
                { title: 'Sector 5, Panchkula', sub: 'Greenfield Enclave' },
                { title: 'Cyber City, Gurugram', sub: 'Building 10A, DLF' },
              ].map((loc) => (
                <div
                  key={loc.title}
                  onClick={() => { setLocation(loc.title); setShowLocationModal(false); }}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: location === loc.title ? '1.5px solid #FF5A1F' : '1px solid #E2E8F0',
                    background: location === loc.title ? '#FFF7ED' : '#F8FAFC',
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{loc.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>{loc.sub}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0F172A', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Close
            </button>
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
            const isActive = tab.key === 'home';
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