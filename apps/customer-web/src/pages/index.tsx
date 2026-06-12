import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, DESIGN_TOKENS, MOTION_EASING, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import styles from './index.module.css';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: number;
  isActive: boolean;
}

const HomePage = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants');
        if (!response.ok) throw new Error('Failed to load restaurants');
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setError('Unable to load restaurants. Please check your connection.');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  const categories = useMemo(() => [
    { name: 'Burgers', icon: '🍔' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Drinks', icon: '🥤' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Healthy', icon: '🥗' },
  ], []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const getTabClass = (tabKey: string) => {
    return `${styles.tab} ${activeTab === tabKey ? styles.activeTab : styles.inactiveTab}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} role="banner">
        <div>
          <h2 className={styles.userName}>
            👋 {user?.name?.split(' ')[0] || 'Guest'}
          </h2>
          <p className={styles.deliveryLocation}>
            Deliver to: Home - Sector 17, Chandigarh
          </p>
        </div>
        <Button
          label="🔔"
          onClick={() => null}
          variant="secondary"
          ariaLabel="Notifications"
        />
      </header>

      <div
        onClick={() => router.push('/search')}
        className={styles.searchBar}
        role="button"
        tabIndex={0}
        aria-label="Search restaurants and dishes"
      >
        <span className={styles.searchIcon}>🔍</span>
        <span className={styles.searchText}>Search restaurants, dishes…</span>
      </div>

      <div className={styles.categoryContainer}>
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={styles.categoryItem}
            role="button"
            tabIndex={0}
            aria-label={`Browse ${cat.name} category`}
          >
            <div className={styles.categoryIcon}>{cat.icon}</div>
            <div className={styles.categoryName}>{cat.name}</div>
          </div>
        ))}
      </div>

      <div
        className={styles.promoBanner}
        onClick={() => router.push('/search')}
      >
        <h2 className={styles.promoTitle}>🎉 50% OFF</h2>
        <p className={styles.promoText}>
          On your first 3 orders. Use code: <strong>WELCOME50</strong>
        </p>
        <div className={styles.promoButton}>
          <Button
            label="Order Now"
            onClick={() => router.push('/search')}
            ariaLabel="Order now with welcome discount"
          />
        </div>
      </div>

      <Card title="Recommended Restaurants" variant="elevated">
        {loading ? (
          <SkeletonCard count={3} />
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button
              onClick={handleRetry}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <p className={styles.noRestaurants}>
            No restaurants available right now
          </p>
        ) : (
          <div className={styles.restaurantItemGrid}>
            {restaurants.slice(0, 3).map((restaurant) => (
              <div
                key={restaurant.id}
                className={styles.restaurantItem}
                onClick={() => router.push(`/restaurant?id=${restaurant.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`View ${restaurant.name} details`}
              >
                <div className={styles.restaurantIcon}>🍽️</div>
                <div className={styles.restaurantContent}>
                  <div className={styles.restaurantName}>
                    {restaurant.name}
                  </div>
                  <div className={styles.restaurantDescription}>
                    {restaurant.description}
                  </div>
                  <div className={styles.restaurantMeta}>
                    <span>⭐ {restaurant.rating}</span>
                    <span>• {restaurant.deliveryTime} min</span>
                    <span>• {Math.round(Math.random() * 5)} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <nav
        className={styles.nav}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.tablist} role="tablist">
          {[
            { key: 'home', label: 'Home', icon: '🏠', path: '/' },
            { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
            { key: 'orders', label: 'Orders', icon: '📦', path: '/history' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
          ].map((tab) => (
            <div
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.path) router.push(tab.path);
              }}
              className={getTabClass(tab.key)}
              role="tab"
              aria-label={tab.label}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
