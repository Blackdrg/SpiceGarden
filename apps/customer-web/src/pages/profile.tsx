import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import { MapPin, CreditCard, Bell, Tag, LifeBuoy, ChevronRight, LogOut, ShieldCheck, Heart, User } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user) || {
    fullName: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    phone: '+91 98765 43210',
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      dispatch(logout());
      router.push('/auth');
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>My Profile | SpiceGarden</title>
      </Head>

      <div className={styles.container}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileCardTop}>
            <div className={styles.avatar}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className={styles.name}>{user.fullName || 'Foodie'}</h1>
              <p className={styles.meta}>{user.email || 'user@spicegarden.com'}</p>
              <p className={styles.meta}>{user.phone || '+91 98765 43210'}</p>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox} onClick={() => router.push('/wallet')}>
              <div className={styles.statVal}>₹500</div>
              <div className={styles.statLabel}>Spice Wallet Balance →</div>
            </div>
            <div className={styles.statBox} onClick={() => router.push('/offers')}>
              <div className={styles.statVal}>4 Active</div>
              <div className={styles.statLabel}>Coupons &amp; Deals →</div>
            </div>
          </div>
        </div>

        {/* Account Menu */}
        <div className={styles.menuSection}>
          <div className={styles.menuItem} onClick={() => router.push('/addresses')}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIconBox}>
                <MapPin size={18} />
              </div>
              <div>
                <h2 className={styles.menuTitle}>Saved Addresses</h2>
                <p className={styles.menuSub}>Home, Work, Other addresses</p>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/payment-methods')}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIconBox}>
                <CreditCard size={18} />
              </div>
              <div>
                <h2 className={styles.menuTitle}>Payment Methods</h2>
                <p className={styles.menuSub}>Cards, UPI Handles, Wallets</p>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/notifications')}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIconBox}>
                <Bell size={18} />
              </div>
              <div>
                <h2 className={styles.menuTitle}>Notifications</h2>
                <p className={styles.menuSub}>Order alerts, offers, SMS</p>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/history')}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIconBox}>
                <OrderIcon size={18} />
              </div>
              <div>
                <h2 className={styles.menuTitle}>Order History &amp; Receipts</h2>
                <p className={styles.menuSub}>View past meals and reorder</p>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>
        </div>

        {/* Support & Legal */}
        <div className={styles.menuSection}>
          <div className={styles.menuItem} onClick={() => alert('📞 Customer Care Helpline: +91 1800 200 400 (Available 24x7)')}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIconBox}>
                <LifeBuoy size={18} />
              </div>
              <div>
                <h2 className={styles.menuTitle}>24x7 Support &amp; Help Center</h2>
                <p className={styles.menuSub}>Instant chat, order issues, refunds</p>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/legal/privacy')}>
            <div className={styles.menuLeft}>
              <div className={styles.menuIconBox}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className={styles.menuTitle}>Privacy &amp; Security Policy</h2>
                <p className={styles.menuSub}>Data protection &amp; encryption terms</p>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>
        </div>

        {/* Logout Button */}
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
          { key: 'orders', label: 'Orders', Icon: OrderIcon, path: '/history' },
          { key: 'account', label: 'Profile', Icon: ProfileIcon, path: '/profile' },
        ].map((tab) => {
          const Icon = tab.Icon;
          const isActive = tab.key === 'account';
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.navButton} ${isActive ? styles.navActive : styles.navInactive}`}
              onClick={() => router.push(tab.path)}
            >
              <Icon size={22} color={isActive ? '#ff5a1f' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
