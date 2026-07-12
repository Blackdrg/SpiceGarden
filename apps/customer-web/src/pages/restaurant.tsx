import React, { useState } from 'react';
import { Button, DESIGN_TOKENS, HomeIcon, SearchIcon, CartIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { ArrowLeftIcon, PlusIcon, StarIcon } from 'lucide-react';
import styles from './restaurant.module.css';

const categories = [
  { id: 'burgers', name: 'Burgers', count: 12 },
  { id: 'sides', name: 'Sides', count: 8 },
  { id: 'drinks', name: 'Drinks', count: 6 },
];

const menuItems = [
  { id: 1, name: 'Whopper', desc: 'Flame-grilled beef patty', price: 149, emoji: '🍔', category: 'burgers' },
  { id: 2, name: 'Chicken Fries', desc: 'Crispy chicken fries', price: 99, emoji: '🍟', category: 'sides' },
  { id: 3, name: 'Coke', desc: '330ml Can', price: 49, emoji: '🥤', category: 'drinks' },
  { id: 4, name: 'Double Cheese', desc: 'Two patties, twice the cheese', price: 199, emoji: '🍔', category: 'burgers' },
  { id: 5, name: 'Veg Burger', desc: 'Crispy veggie patty', price: 129, emoji: '🍔', category: 'burgers' },
  { id: 6, name: 'Large Coke', desc: '1.25L Bottle', price: 79, emoji: '🥤', category: 'drinks' },
];

const RestaurantPage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('burgers');
  const dispatch = useDispatch();

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((item) => item.category === activeCategory);

  const handleAddToCart = (item: typeof menuItems[0]) => {
    dispatch(addToCart({
      item: {
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: 1,
      },
      restaurantId: 'rest-001'
    }));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <Button onClick={() => router.back()} variant="secondary">
          <ArrowLeftIcon size={18} />
        </Button>
      </div>

      <div className={styles.restaurantHeader}>
        <h2 className={styles.restaurantName}>🍔 Burger King</h2>
        <p className={styles.restaurantMeta}>
          <StarIcon size={14} fill={DESIGN_TOKENS.colors.warning} color={DESIGN_TOKENS.colors.warning} />
          {' '}4.2 · 25–30 min · ₹199 minimum
        </p>
      </div>

      <div className={styles.categorySection}>
        <div className={styles.categoryList}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.categoryChip} ${activeCategory === c.id ? styles.categoryChipActive : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      </div>

      <div className={styles.menuList}>
        {filtered.map((item) => (
          <div
            key={item.id}
            className={styles.menuItem}
          >
            <div className={styles.itemInfo}>
              <div className={styles.itemEmoji}>{item.emoji}</div>
              <div className={styles.itemText}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemDesc}>{item.desc}</div>
              </div>
            </div>
            <div className={styles.itemActions}>
              <span className={styles.itemPrice}>₹{item.price}</span>
              <Button onClick={() => handleAddToCart(item)} variant="secondary" size="sm">
                <PlusIcon size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'menu', label: 'Menu', icon: CartIcon, path: '/menu' },
          { key: 'account', label: 'Account', icon: ProfileIcon, path: '/profile' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => router.push(tab.path)}
            className={`${styles.navButton} ${tab.key === 'menu' ? styles.navActive : styles.navInactive}`}
            aria-label={tab.label}
          >
            <span className={styles.navIcon}><tab.icon size={22} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default RestaurantPage;
