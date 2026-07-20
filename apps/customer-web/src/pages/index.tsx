import React from 'react';
import {
  Button, Card, DESIGN_TOKENS,
  BurgerIcon, PizzaIcon, DrinkIcon, DessertIcon, HealthyIcon,
  HomeIcon, SearchIcon, CartIcon, ProfileIcon, LocationIcon,
  RatingIcon, NotificationIcon, SearchIcon as SearchIconLucide,
} from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useQuery } from '@tanstack/react-query';
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

const categoryColors: Record<string, string> = {
  Burgers: '#FF5A1F',
  Pizza: '#EF4444',
  Drinks: '#3B82F6',
  Dessert: '#EC4899',
  Healthy: '#10B981',
};

const distanceFromId = (id: string) => {
  const hash = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (0.5 + (hash % 50) / 10).toFixed(1);
};

const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const response = await fetch('/api/restaurants');
  if (!response.ok) throw new Error('Failed to load restaurants');
  return response.json();
};

const handleRetry = () => {
  window.location.reload();
};

const categories: Category[] = [
  { name: 'Burgers', Icon: BurgerIcon },
  { name: 'Pizza', Icon: PizzaIcon },
  { name: 'Drinks', Icon: DrinkIcon },
  { name: 'Dessert', Icon: DessertIcon },
  { name: 'Healthy', Icon: HealthyIcon },
];

const navTabs: NavTab[] = [
  { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
  { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
  { key: 'orders', label: 'Orders', Icon: CartIcon, path: '/history' },
  { key: 'account', label: 'Account', Icon: ProfileIcon, path: '/profile' },
];

const HomePage = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: restaurants = [], isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });

  const error = fetchError instanceof Error ? fetchError.message : null;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.userName}>
            <LocationIcon size={20} color={DESIGN_TOKENS.colors.primary} />
            {user?.name?.split(' ')[0] || 'Guest'}
          </h2>
          <p className={styles.deliveryLocation}>
            Deliver to: Home - Sector 17, Chandigarh
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => router.push('/notifications')}
            className={styles.iconButton}
            aria-label="Notifications"
          >
            <NotificationIcon size={20} />
          </button>
        </div>
      </header>

      <div className={styles.searchSection}>
        <button
          type="button"
          onClick={() => router.push('/search')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/search'); } }}
          className={styles.searchBar}
          aria-label="Search restaurants and dishes"
        >
          <span className={styles.searchIcon}><SearchIconLucide size={20} /></span>
          <span className={styles.searchText}>Search restaurants, dishes…</span>
        </button>
      </div>

      <div className={styles.categoryContainer}>
        {categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className={styles.categoryItem}
            aria-label={`Browse ${cat.name} category`}
          >
            <div className={styles.categoryIconWrap} style={{ backgroundColor: categoryColors[cat.name] + '15' }}>
              <cat.Icon size={24} color={categoryColors[cat.name]} />
            </div>
            <div className={styles.categoryName}>{cat.name}</div>
          </button>
        ))}
      </div>

      <div className={styles.promoSection}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push('/search')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/search'); } }}
          className={styles.promoBanner}
        >
          <h2 className={styles.promoTitle}>50% OFF</h2>
          <p className={styles.promoText}>
            On your first 3 orders. Use code: <strong>WELCOME50</strong>
          </p>
          <div className={styles.promoButton}>
            <Button label="Order Now" onClick={() => router.push('/search')} ariaLabel="Order now with welcome discount" />
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Recommended Restaurants</h2>
      {loading ? (
        <div className={styles.restaurantGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.restaurantItem} style={{ cursor: 'default' }}>
              <div className={styles.restaurantContent}>
                <div className={styles.restaurantName} style={{ width: '60%' }}>Loading...</div>
                <div className={styles.restaurantDescription} style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
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
        <div className={styles.noRestaurants}>
          No restaurants available right now
        </div>
      ) : (
        <div className={styles.restaurantGrid}>
          {restaurants.slice(0, 3).map((restaurant) => (
            <button
              type="button"
              key={restaurant.id}
              className={styles.restaurantItem}
              onClick={() => router.push(`/restaurant?id=${restaurant.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/restaurant?id=${restaurant.id}`); } }}
              aria-label={`View ${restaurant.name} details`}
            >
              <div className={styles.restaurantContent}>
                <div className={styles.restaurantName}>{restaurant.name}</div>
                <div className={styles.restaurantDescription}>{restaurant.description}</div>
                <div className={styles.restaurantMeta}>
                  <span>
                    <RatingIcon size={14} fill={DESIGN_TOKENS.colors.warning} />
                    {' '}{restaurant.rating}
                  </span>
                  <span>{restaurant.deliveryTime} min</span>
                  <span>{distanceFromId(restaurant.id)} km</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <nav
        className={styles.nav}
        aria-label="Main navigation"
      >
        <div className={styles.tablist}>
          {navTabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => {
                if (tab.path) router.push(tab.path);
              }}
              className={`${tab.key === 'home' ? styles.activeTab : styles.inactiveTab}`}
              aria-label={tab.label}
            >
              <span className={styles.tabIcon}><tab.Icon size={22} /></span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
