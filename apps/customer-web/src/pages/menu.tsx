import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, Skeleton, HomeIcon, SearchIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { ShoppingCartIcon, PlusIcon } from 'lucide-react';
import styles from './menu.module.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryName: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const MenuPage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<MenuItem & { quantity: number }>>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const cats = await res.json();
          const allItems: MenuItem[] = [];
          const categoryMap = new Map<string, Category>();

          cats.forEach((cat: any) => {
            categoryMap.set(cat.name, { id: cat.name, name: cat.name, count: cat.items?.length || 0 });
            if (cat.items) {
              cat.items.forEach((item: any) => {
                allItems.push({
                  id: item.id,
                  name: item.name,
                  description: item.description || '',
                  price: item.price,
                  image: item.image || '🍽️',
                  category: cat.id,
                  categoryName: cat.name,
                });
              });
            }
          });

          setMenuItems(allItems);
          setCategories([
            { id: 'all', name: 'All', count: allItems.length },
            ...Array.from(categoryMap.values()),
          ]);
        }
      } catch {
        // keep empty state on error
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.categoryName === activeCategory || item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const removeFromCart = (itemId: string) => {
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
                  <div className={styles.itemDesc}>{item.description}</div>
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
      <nav className={styles.bottomNav} aria-label="Main navigation">
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
            <span className={styles.navIcon}><tab.icon size={20} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MenuPage;
