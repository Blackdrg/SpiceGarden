import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, Skeleton, HomeIcon, SearchIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { ShoppingCartIcon, PlusIcon } from 'lucide-react';
import styles from './menu.module.css';

interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const categories: Category[] = [
  { id: 'all', name: 'All', count: 24 },
  { id: 'burgers', name: 'Burgers', count: 8 },
  { id: 'pizza', name: 'Pizza', count: 6 },
  { id: 'sides', name: 'Sides', count: 4 },
  { id: 'drinks', name: 'Drinks', count: 6 },
];

const menuItems: MenuItem[] = [
  { id: 1, name: 'Classic Burger', desc: 'Lettuce, tomato, onion', price: 129, image: '🍔', category: 'burgers' },
  { id: 2, name: 'Cheese Burger', desc: 'With extra cheese', price: 149, image: '🍔', category: 'burgers' },
  { id: 3, name: 'Veggie Burger', desc: 'Plant-based patty', price: 139, image: '🍔', category: 'burgers' },
  { id: 4, name: 'Margherita Pizza', desc: 'Tomato, mozzarella, basil', price: 249, image: '🍕', category: 'pizza' },
  { id: 5, name: 'Pepperoni Pizza', desc: 'With spicy pepperoni', price: 279, image: '🍕', category: 'pizza' },
  { id: 6, name: 'Veggie Pizza', desc: 'Bell peppers, olives, onions', price: 259, image: '🍕', category: 'pizza' },
  { id: 7, name: 'French Fries', desc: 'Crispy golden fries', price: 99, image: '🍟', category: 'sides' },
  { id: 8, name: 'Onion Rings', desc: 'Battered and fried', price: 109, image: '🧅', category: 'sides' },
  { id: 9, name: 'Garlic Bread', desc: 'With herbs and cheese', price: 119, image: '🥖', category: 'sides' },
  { id: 10, name: 'Coca Cola', desc: '500ml Bottle', price: 49, image: '🥤', category: 'drinks' },
  { id: 11, name: 'Sprite', desc: '500ml Bottle', price: 49, image: '🥤', category: 'drinks' },
  { id: 12, name: 'Iced Tea', desc: 'Lemon flavored', price: 39, image: '🧃', category: 'drinks' },
];

const MenuPage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<MenuItem & { quantity: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    const items = JSON.stringify(cart);
    router.push({ pathname: '/checkout', query: { items, total: cartTotal } });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Menu</h2>
        <p className={styles.pageSubtitle}>Select items to add to your order</p>
      </div>

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

      <div className={styles.itemsList}>
        {loading ? (
          <div className={styles.itemsList}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonItem}>
                <div className={styles.skeletonHeader}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <div>
                    <Skeleton height={16} width="70%" style={{ marginBottom: 4 }} />
                    <Skeleton height={14} width="40%" />
                  </div>
                </div>
                <Skeleton height={12} style={{ marginTop: 8 }} />
                <Skeleton height={12} width="80%" />
                <Skeleton height={12} width="60%" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>🍽️</div>
            <h3 className={styles.emptyText}>No items found</h3>
            <p className={styles.emptyHelpText}>
              Try selecting a different category or check back later for new items.
            </p>
            <Button
              label="Explore More"
              onClick={() => setActiveCategory('all')}
              variant="outline"
            />
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className={styles.menuItem}>
              <div className={styles.itemHeader}>
                <div className={styles.itemImage}>{item.image}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemDesc}>{item.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={styles.itemPrice}>₹{item.price}</span>
                  <Button
                    onClick={() => addToCart(item)}
                    variant="secondary"
                    size="sm"
                  >
                    <PlusIcon size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className={styles.cartSection}>
          <Card title="Your Cart" variant="elevated">
            <div className={styles.cartItemsList}>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItemRow}>
                  <div>
                    <h4 className={styles.cartItemName}>{item.name}</h4>
                    <p className={styles.cartItemQty}>×{item.quantity}</p>
                  </div>
                  <div className={styles.cartItemRight}>
                    <div className={styles.cartItemPrice}>
                      ₹{item.price * item.quantity}
                    </div>
                    <Button
                      label="Remove"
                      onClick={() => removeFromCart(item.id)}
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.cartTotalRow}>
              <span>Total:</span>
              <span className={styles.cartTotalText}>₹{cartTotal}</span>
              <Button label="Checkout" onClick={handleCheckout} size="sm" />
            </div>
          </Card>
        </div>
      )}

      {/* Bottom nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'menu', label: 'Menu', icon: ShoppingCartIcon, path: '/menu' },
          { key: 'account', label: 'Account', icon: ProfileIcon, path: '/profile' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            className={`${styles.navButton} ${tab.key === 'menu' ? styles.navButtonActive : styles.navButtonInactive}`}
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

export default MenuPage;
