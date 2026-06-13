import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, Card, DESIGN_TOKENS, MOTION_EASING, SkeletonCard,
  BurgerIcon, PizzaIcon, DrinkIcon, DessertIcon, HealthyIcon,
  HomeIcon, SearchIcon, CartIcon, ProfileIcon, LocationIcon,
  RatingIcon, NotificationIcon,
} from '@spicegarden/ui';
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

interface Category {
  name: string;
  Icon: React.FC<{ size?: number; color?: string }>;
}

interface NavTab {
  key: string;
  label: string;
  Icon: React.FC<{ size?: number; color?: string }>;
  path: string;
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

  const categories = useMemo<Category[]>(() => [
    { name: 'Burgers', Icon: BurgerIcon },
    { name: 'Pizza', Icon: PizzaIcon },
    { name: 'Drinks', Icon: DrinkIcon },
    { name: 'Dessert', Icon: DessertIcon },
    { name: 'Healthy', Icon: HealthyIcon },
  ], []);

  const navTabs = useMemo<NavTab[]>(() => [
    { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
    { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
    { key: 'orders', label: 'Orders', Icon: CartIcon, path: '/history' },
    { key: 'account', label: 'Account', Icon: ProfileIcon, path: '/profile' },
  ], []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const getTabClass = (tabKey: string) => {
    return `${styles.tab} ${activeTab === tabKey ? styles.activeTab : styles.inactiveTab}`;
  };

  const renderCategoryIcon = (Icon: Category['Icon'], name: string) => {
    const colors: Record<string, string> = {
      Burgers: '#FF5A1F',
      Pizza: '#EF4444',
      Drinks: '#3B82F6',
      Dessert: '#EC4899',
      Healthy: '#10B981',
    };
    return <Icon size={28} color={colors[name]} />;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} role="banner">
        <div>
          <h2 className={styles.userName}>
            <LocationIcon size={20} color={DESIGN_TOKENS.colors.primary} />
            {' '}{user?.name?.split(' ')[0] || 'Guest'}
          </h2>
          <p className={styles.deliveryLocation}>
            Deliver to: Home - Sector 17, Chandigarh
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => null}
            className={styles.iconButton}
            aria-label="Notifications"
          >
            <NotificationIcon size={20} />
          </button>
        </div>
      </header>

        <button
          onClick={() => router.push('/search')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/search'); } }}
          className={styles.searchBar}
          aria-label="Search restaurants and dishes"
        >
        <span className={styles.searchIcon}><SearchIcon size={20} /></span>
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
            <div className={styles.categoryIcon}>
              {renderCategoryIcon(cat.Icon, cat.name)}
            </div>
            <div className={styles.categoryName}>{cat.name}</div>
          </div>
        ))}
      </div>

        <button
          type="button"
          onClick={() => router.push('/search')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/search'); } }}
          className={styles.promoBanner}
        >
        <h2 className={styles.promoTitle}>50% OFF</h2>
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
              type="button"
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
              <button
                key={restaurant.id}
                className={styles.restaurantItem}
                onClick={() => router.push(`/restaurant?id=${restaurant.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/restaurant?id=${restaurant.id}`); } }}
                aria-label={`View ${restaurant.name} details`}
              >
                <div className={styles.restaurantContent}>
                  <div className={styles.restaurantName}>
                    {restaurant.name}
                  </div>
                  <div className={styles.restaurantDescription}>
                    {restaurant.description}
                  </div>
                  <div className={styles.restaurantMeta}>
                    <span>
                      <RatingIcon size={14} fill={DESIGN_TOKENS.colors.warning} />
                      {' '}{restaurant.rating}
                    </span>
                    <span>{restaurant.deliveryTime} min</span>
                    <span>{(Math.round(Math.random() * 5) / 10 + 0.5).toFixed(1)} km</span>
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
          {navTabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.path) router.push(tab.path);
              }}
              className={getTabClass(tab.key)}
              role="tab"
              aria-label={tab.label}
            >
              <span className={styles.tabIcon}><tab.Icon size={22} /></span>
              <span>{tab.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
