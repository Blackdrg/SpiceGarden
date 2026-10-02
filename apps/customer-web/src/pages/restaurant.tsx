import React, { useState } from 'react';
import { Button, DESIGN_TOKENS, BurgerIcon, DrinkIcon, PackageIcon, HomeIcon, SearchIcon, CartIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const categories = [
  { id: 'burgers', name: 'Burgers', count: 12 },
  { id: 'sides', name: 'Sides', count: 8 },
  { id: 'drinks', name: 'Drinks', count: 6 },
];

const menuItems = [
  { id: 1, name: 'Whopper', desc: 'Flame-grilled beef patty', price: 149, category: 'burgers' },
  { id: 2, name: 'Chicken Fries', desc: 'Crispy chicken fries', price: 99, category: 'sides' },
  { id: 3, name: 'Coke', desc: '330ml Can', price: 49, category: 'drinks' },
  { id: 4, name: 'Double Cheese', desc: 'Two patties, twice the cheese', price: 199, category: 'burgers' },
  { id: 5, name: 'Veg Burger', desc: 'Crispy veggie patty', price: 129, category: 'burgers' },
  { id: 6, name: 'Large Coke', desc: '1.25L Bottle', price: 79, category: 'drinks' },
];

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: DESIGN_TOKENS.spacing.sm,
  backgroundColor: 'white',
  borderRadius: DESIGN_TOKENS.radius.md,
  cursor: 'pointer',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const bottomNavStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 60,
  backgroundColor: 'white',
  borderTop: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  zIndex: 100,
};

const navButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '4px 8px',
  fontSize: '12px',
};

const RestaurantPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState<string>('burgers');

  const filtered = activeCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80, backgroundColor: DESIGN_TOKENS.colors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
        <h2 style={{ margin: 0 }}>Burger King</h2>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Fast Food · American · 25-30 min · ₹150 for two</p>
      </div>

      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.xs, marginBottom: DESIGN_TOKENS.spacing.md, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((c) => (
          <Button
            key={c.id}
            label={`${c.name} (${c.count})`}
            onClick={() => setActiveCategory(c.id)}
            variant={activeCategory === c.id ? 'primary' : 'secondary'}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
        {filtered.map((item) => {
          const Icon = item.category === 'burgers' ? BurgerIcon : item.category === 'drinks' ? DrinkIcon : PackageIcon;
          return (
            <div
              key={item.id}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.sm, flex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color="#f04e31" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>{item.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary, whiteSpace: 'nowrap' }}>&#8377;{item.price}</span>
                <Button label="+" onClick={() => {
                  const customization = window.prompt("Add special instructions (e.g., 'No onions', 'Extra spicy'):");
                  dispatch(addToCart({ 
                    item: { 
                      id: item.id.toString(), 
                      name: item.name, 
                      price: item.price, 
                      quantity: 1,
                      customization: customization || undefined,
                      specialInstructions: customization || undefined
                    }, 
                    restaurantId: 'rest-001'
                  }));
                }} variant="secondary" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <nav style={bottomNavStyle}>
        {[
          { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
          { key: 'menu', label: 'Menu', Icon: CartIcon, path: '/menu' },
          { key: 'account', label: 'Account', Icon: ProfileIcon, path: '/profile' },
        ].map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => router.push(tab.path)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(tab.path); } }}
              style={{ ...navButtonStyle, color: tab.key === 'menu' ? DESIGN_TOKENS.colors.primary : '#999' }}
            >
              <Icon size={20} color={tab.key === 'menu' ? DESIGN_TOKENS.colors.primary : '#999'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default RestaurantPage;
