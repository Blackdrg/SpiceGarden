import React, { useState, useEffect } from 'react';
import { Button, DESIGN_TOKENS, HomeIcon, SearchIcon, CartIcon, ProfileIcon, Skeleton } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { ArrowLeftIcon, PlusIcon, StarIcon } from 'lucide-react';
import styles from './restaurant.module.css';

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

const RestaurantPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurant, setRestaurant] = useState<{ name: string; rating: number; deliveryTime: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [restaurantRes, menuRes] = await Promise.all([
          fetch(`/api/restaurants?id=${encodeURIComponent(id)}`),
          fetch(`/api/menu?restaurantId=${encodeURIComponent(id)}`),
        ]);

        if (restaurantRes.ok) {
          const restaurantData = await restaurantRes.json();
          setRestaurant({
            name: restaurantData.name || 'Restaurant',
            rating: restaurantData.rating || 4.0,
            deliveryTime: restaurantData.deliveryTime || 30,
          });
        }

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenuItems(menuData);

          const categoryMap = new Map<string, { id: string; name: string; count: number }>();
          menuData.forEach((item: MenuItem) => {
            const catName = item.categoryName || item.category || 'Other';
            if (!categoryMap.has(catName)) {
              categoryMap.set(catName, { id: catName, name: catName, count: 0 });
            }
            categoryMap.get(catName)!.count++;
          });
          setCategories(Array.from(categoryMap.values()));
        }
      } catch {
        setError('Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((item) => item.category === (categories.find(c => c.id === activeCategory)?.name || activeCategory) || item.category === activeCategory);

  const handleAddToCart = (item: MenuItem) => {
    dispatch(addToCart({
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      },
      restaurantId: typeof id === 'string' ? id : 'rest-001'
    }));
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <Button onClick={() => router.back()} variant="secondary"><ArrowLeftIcon size={18} /></Button>
          <Skeleton height={24} width="60%" />
        </div>
        <div className={styles.categorySection}>
          <div className={styles.categoryList}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={32} width={80} style={{ marginRight: 8 }} />
            ))}
          </div>
        </div>
        <div className={styles.menuList}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.menuItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemEmoji}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <Skeleton height={16} width="70%" style={{ marginBottom: 4 }} />
                  <Skeleton height={14} width="40%" />
                </div>
              </div>
              <Skeleton height={32} width={32} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <Button onClick={() => router.back()} variant="secondary"><ArrowLeftIcon size={18} /></Button>
        </div>
        <p>{error || 'Restaurant not found'}</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <Button onClick={() => router.back()} variant="secondary">
          <ArrowLeftIcon size={18} />
        </Button>
      </div>

      <div className={styles.restaurantHeader}>
        <h2 className={styles.restaurantName}>{restaurant.name}</h2>
        <p className={styles.restaurantMeta}>
          <StarIcon size={14} fill={DESIGN_TOKENS.colors.warning} color={DESIGN_TOKENS.colors.warning} />
          {' '}{restaurant.rating} · {restaurant.deliveryTime} min
        </p>
      </div>

      <div className={styles.categorySection}>
        <div className={styles.categoryList}>
          <button
            key="all"
            type="button"
            className={`${styles.categoryChip} ${activeCategory === 'all' ? styles.categoryChipActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All ({menuItems.length})
          </button>
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
        {filtered.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>🍽️</div>
            <h3 className={styles.emptyText}>No items found</h3>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className={styles.menuItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemEmoji}>{item.image || '🍽️'}</div>
                <div className={styles.itemText}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemDesc}>{item.description}</div>
                </div>
              </div>
              <div className={styles.itemActions}>
                <span className={styles.itemPrice}>₹{item.price}</span>
                <Button onClick={() => handleAddToCart(item)} variant="secondary" size="sm">
                  <PlusIcon size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
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
