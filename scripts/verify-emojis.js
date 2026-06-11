const fs = require('fs');

const EMOJIS = [
  '🔥','🍔','🍕','🍟','🧅','🥖','🥤','🧃',
  '👋','🔔','🔍','🎉','🍽️','⭐','👤','📦',
  '🛵','📋','💰','🏠','🎁','📵','🕒','📶',
  '📞','✓','✗','⚠️','✕','🛒','🚧','⏰',
  '📍','🚗','✅','🏪','📅','🏆','✋','🚨',
  '🚚','🛍️','🏁','❗','⏳','⚡','🤝',
];

const pattern = new RegExp(EMOJIS.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

const files = [
  'apps/customer-web/src/pages/history.tsx',
  'apps/customer-web/src/pages/index.tsx',
  'apps/customer-web/src/pages/menu.tsx',
  'apps/customer-web/src/pages/offers.tsx',
  'apps/customer-web/src/pages/order-details.tsx',
  'apps/customer-web/src/pages/profile.tsx',
  'apps/customer-web/src/pages/restaurant.tsx',
  'apps/customer-web/src/pages/search.tsx',
  'apps/customer-web/src/pages/subscriptions.tsx',
  'apps/customer-web/src/pages/wallet.tsx',
  'apps/customer-web/src/pages/tracking.tsx',
  'apps/customer-web/src/pages/cart.tsx',
  'apps/customer-web/src/pages/checkout.tsx',
  'apps/customer-web/src/pages/auth.tsx',
  'apps/customer-web/src/pages/reset-password.tsx',
  'apps/customer-web/src/components/OfflineIndicator.tsx',
  'apps/customer-mobile/App.tsx',
  'apps/customer-mobile/src/components/EmptyState.tsx',
  'apps/customer-mobile/src/screens/RestaurantScreen.tsx',
  'apps/customer-mobile/src/screens/HomeScreen.tsx',
  'apps/customer-mobile/src/screens/SearchScreen.tsx',
  'apps/customer-mobile/src/screens/ProfileScreen.tsx',
  'apps/customer-mobile/src/screens/CartScreen.tsx',
  'apps/customer-mobile/src/screens/OnboardingScreen.tsx',
  'apps/restaurant-dashboard/src/pages/index.tsx',
  'apps/restaurant-dashboard/src/pages/onboarding/documents.tsx',
  'apps/delivery-partner/App.tsx',
  'packages/ui/FlowManager.tsx',
];

let remaining = 0;
files.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  const c = fs.readFileSync(fp, 'utf8');
  const m = c.match(pattern);
  if (m && m.length > 0) {
    remaining += m.length;
    console.log('REMAINING: ' + fp + ': ' + m.length);
  }
});
console.log('\nTotal remaining emojis in TSX: ' + remaining);
if (remaining === 0) console.log('ALL CLEAN!');
