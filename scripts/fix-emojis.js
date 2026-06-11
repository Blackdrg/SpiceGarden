const fs = require('fs');

// Explicit emoji characters we want to replace - NO generic regex
const EMOJIS = [
  '🔥','🍔','🍕','🍟','🧅','🥖','🥤','🧃',
  '👋','🔔','🔍','🎉','🍽️','⭐','👤','📦',
  '🛵','📋','💰','🏠','🎁','📵','🕒','📶',
  '📞','✓','✗','⚠️','✕','🛒','🚧','⏰',
  '📍','🚗','✅','🏪','📅','🏆','✋','🚨',
  '🚚','🛍️','🏁','❗','⏳','⚡','🤝','⭐',
];

const REPLACEMENTS = {
  '🔥': '<Flame size={20} color="#f04e31" />',
  '🍔': '<Hamburger size={24} />',
  '🍕': '<Pizza size={24} />',
  '🍟': '<UtensilsCrossed size={24} />',
  '🧅': '<UtensilsCrossed size={24} />',
  '🥖': '<UtensilsCrossed size={24} />',
  '🥤': '<Wine size={24} />',
  '🧃': '<Wine size={24} />',
  '👋': '<Hand size={20} />',
  '🔔': '<Bell size={18} />',
  '🔍': '<Search size={18} />',
  '🎉': '<PartyPopper size={24} />',
  '🍽️': '<Utensils size={32} />',
  '⭐': '<Star size={14} fill="#fbbf24" color="#fbbf24" />',
  '👤': '<User size={48} color="white" />',
  '📦': '<Package size={48} />',
  '🛵': '<Bike size={64} />',
  '📋': '<ClipboardList size={22} />',
  '💰': '<Wallet size={22} />',
  '🏠': '<Home size={22} />',
  '🎁': '<Gift size={22} />',
  '📵': '<WifiOff size={16} />',
  '🕒': '<Clock size={16} />',
  '📶': '<Wifi size={16} />',
  '📞': '<Phone size={14} />',
  '✓': '<Check size={14} color="#4caf50" />',
  '✗': '<X size={14} color="#ef4444" />',
  '⚠️': '<AlertCircle size={16} color="#f59e0b" />',
  '✕': '<X size={14} color="#ef4444" />',
  '🛒': '<ShoppingCart size={40} />',
  '🚧': '<AlertTriangle size={24} />',
  '⏰': '<Clock size={24} />',
  '📍': '<MapPin size={24} />',
  '🚗': '<Car size={24} />',
  '✅': '<CheckCircle size={24} color="#4caf50" />',
  '🏪': '<Store size={24} />',
  '📅': '<Calendar size={24} />',
  '🏆': '<Trophy size={24} />',
  '✋': '<Hand size={24} />',
  '🚨': '<Siren size={24} color="#ef4444" />',
  '🚚': '<Truck size={24} />',
  '🛍️': '<ShoppingBag size={24} />',
  '🏁': '<Flag size={24} />',
  '❗': '<AlertCircle size={24} color="#ef4444" />',
  '⏳': '<Clock size={24} />',
  '⚡': '<Zap size={24} />',
  '🤝': '<Handshake size={24} />',
};

// Build regex from explicit characters only
const emojiPattern = new RegExp(EMOJIS.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

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
  'apps/customer-web/src/pages/cart.tsx',
  'apps/customer-web/src/pages/checkout.tsx',
  'apps/customer-web/src/pages/tracking.tsx',
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

let totalFiles = 0;

files.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let c = fs.readFileSync(fp, 'utf8');
  const matches = c.match(emojiPattern);
  if (!matches || matches.length === 0) {
    console.log(fp + ': CLEAN');
    return;
  }
  
  const unique = [...new Set(matches)];
  console.log(fp + ': ' + matches.length + ' emojis, unique: ' + unique.join(','));
  
  unique.forEach(emoji => {
    const replacement = REPLACEMENTS[emoji];
    if (replacement) {
      c = c.split(emoji).join(replacement);
    }
  });
  
  fs.writeFileSync(fp, c);
  totalFiles++;
});

console.log('\nTotal files fixed: ' + totalFiles);
