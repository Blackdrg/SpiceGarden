const fs = require('fs');
const path = require('path');

const EMOJIS = [
  '\u{1F525}','\u{1F354}','\u{1F355}','\u{1F35F}','\u{1F9C5}','\u{1F96E}','\u{1F964}','\u{1F9C3}',
  '\u{1F44B}','\u{1F514}','\u{1F50D}','\u{1F389}','\u{1F37D}','\u{1F37D}\u{FE0F}','\u{2B50}','\u{1F464}',
  '\u{1F4E6}','\u{1F6F5}','\u{1F4CB}','\u{1F4B0}','\u{1F3E0}','\u{1F381}','\u{1F4F5}','\u{1F554}',
  '\u{1F4F6}','\u{1F4DE}','\u{2713}','\u{2717}','\u{26A0}','\u{26A0}\u{FE0F}','\u{2715}','\u{1F6D2}',
  '\u{1F6A7}','\u{23F0}','\u{1F4CD}','\u{1F697}','\u{2705}','\u{1F3EA}','\u{1F4C5}','\u{1F3C6}',
  '\u{270B}','\u{1F6A8}','\u{1F69A}','\u{1F6CD}\u{FE0F}','\u{1F3C1}','\u{2757}','\u{23F3}','\u{26A1}',
  '\u{1F91F}','\u{2B50}','\u{1F956}','\u{1F50B}','\u{2699}','\u{FE0F}',
];

// web/React replacements (lucide-react JSX)
const WEB_REPLACEMENTS = {
  '\u{1F525}': '<Flame size={20} color="#f04e31" />',
  '\u{1F354}': '<Hamburger size={24} />',
  '\u{1F355}': '<Pizza size={24} />',
  '\u{1F35F}': '<UtensilsCrossed size={24} />',
  '\u{1F9C5}': '<UtensilsCrossed size={24} />',
  '\u{1F96E}': '<UtensilsCrossed size={24} />',
  '\u{1F964}': '<Wine size={24} />',
  '\u{1F956}': '<UtensilsCrossed size={24} />',
  '\u{1F9C3}': '<Wine size={24} />',
  '\u{1F44B}': '<Hand size={20} />',
  '\u{1F514}': '<Bell size={18} />',
  '\u{1F50D}': '<Search size={18} />',
  '\u{1F389}': '<PartyPopper size={24} />',
  '\u{1F37D}\u{FE0F}': '<Utensils size={32} />',
  '\u{2B50}': '<Star size={14} fill="#fbbf24" color="#fbbf24" />',
  '\u{1F464}': '<User size={48} color="white" />',
  '\u{1F4E6}': '<Package size={48} />',
  '\u{1F6F5}': '<Bike size={64} />',
  '\u{1F4CB}': '<ClipboardList size={22} />',
  '\u{1F4B0}': '<Wallet size={22} />',
  '\u{1F3E0}': '<Home size={22} />',
  '\u{1F381}': '<Gift size={22} />',
  '\u{1F4F5}': '<WifiOff size={16} />',
  '\u{1F554}': '<Clock size={16} />',
  '\u{1F4F6}': '<Wifi size={16} />',
  '\u{1F4DE}': '<Phone size={14} />',
  '\u{2713}': '<Check size={14} color="#4caf50" />',
  '\u{2717}': '<X size={14} color="#ef4444" />',
  '\u{26A0}\u{FE0F}': '<AlertCircle size={16} color="#f59e0b" />',
  '\u{2715}': '<X size={14} color="#ef4444" />',
  '\u{1F6D2}': '<ShoppingCart size={40} />',
  '\u{1F6A7}': '<AlertTriangle size={24} />',
  '\u{23F0}': '<Clock size={24} />',
  '\u{1F4CD}': '<MapPin size={24} />',
  '\u{1F697}': '<Car size={24} />',
  '\u{2705}': '<CheckCircle size={24} color="#4caf50" />',
  '\u{1F3EA}': '<Store size={24} />',
  '\u{1F4C5}': '<Calendar size={24} />',
  '\u{1F3C6}': '<Trophy size={24} />',
  '\u{270B}': '<Hand size={24} />',
  '\u{1F6A8}': '<Siren size={24} color="#ef4444" />',
  '\u{1F69A}': '<Truck size={24} />',
  '\u{1F6CD}\u{FE0F}': '<ShoppingBag size={24} />',
  '\u{1F3C1}': '<Flag size={24} />',
  '\u{2757}': '<AlertCircle size={24} color="#ef4444" />',
  '\u{23F3}': '<Clock size={24} />',
  '\u{26A1}': '<Zap size={24} />',
  '\u{1F91F}': '<Handshake size={24} />',
  '\u{1F956}': '<Ionicons name="restaurant" size={24} />',
  '\u{1F50B}': '<Ionicons name="battery" size={24} />',
  '\u{2699}': '<Ionicons name="settings" size={16} />',
};

const emojiPattern = new RegExp(EMOJIS.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu');

// web app files (lucide-react)
const webFiles = [
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
  'apps/restaurant-dashboard/src/pages/index.tsx',
  'apps/restaurant-dashboard/src/pages/onboarding/documents.tsx',
  'apps/super-admin/src/App.tsx',
  'packages/ui/FlowManager.tsx',
];

// mobile app files (Ionicons) - different replacement format
const mobileFiles = [
  'apps/customer-mobile/App.tsx',
  'apps/customer-mobile/src/components/EmptyState.tsx',
  'apps/customer-mobile/src/screens/RestaurantScreen.tsx',
  'apps/customer-mobile/src/screens/HomeScreen.tsx',
  'apps/customer-mobile/src/screens/SearchScreen.tsx',
  'apps/customer-mobile/src/screens/ProfileScreen.tsx',
  'apps/customer-mobile/src/screens/CartScreen.tsx',
  'apps/customer-mobile/src/screens/OnboardingScreen.tsx',
];

const IONICONS_REPLACEMENTS = {
  '\u{1F3E0}': '<Ionicons name="home" size={22} />',
  '\u{1F50D}': '<Ionicons name="search" size={18} />',
  '\u{1F6D2}': '<Ionicons name="cart" size={24} />',
  '\u{1F464}': '<Ionicons name="person" size={24} />',
  '\u{1F4CB}': '<Ionicons name="document-text" size={24} />',
  '\u{2B50}': '<Ionicons name="star" size={14} color="#fbbf24" />',
  '\u{1F6F5}': '<Ionicons name="bicycle" size={48} />',
  '\u{1F37D}\u{FE0F}': '<Ionicons name="restaurant" size={32} />',
  '\u{1F4CD}': '<Ionicons name="location" size={16} />',
  '\u{1F4B0}': '<Ionicons name="wallet" size={22} />',
  '\u{1F4DE}': '<Ionicons name="call" size={14} />',
  '\u{1F514}': '<Ionicons name="notifications" size={22} />',
  '\u{1F44B}': '<Ionicons name="hand" size={20} />',
  '\u{1F389}': '<Ionicons name="rocket" size={24} />',
  '\u{1F525}': '<Ionicons name="flame" size={20} color="#f04e31" />',
  '\u{1F4F5}': '<Ionicons name="wifi" size={16} />',
  '\u{1F4F6}': '<Ionicons name="wifi" size={16} />',
  '\u{1F4E6}': '<Ionicons name="cube" size={48} />',
  '\u{1F35F}': '<Ionicons name="fast-food" size={24} />',
  '\u{1F354}': '<Ionicons name="pizza" size={24} />',
  '\u{1F355}': '<Ionicons name="pizza" size={24} />',
  '\u{2713}': '<Ionicons name="checkmark" size={14} color="#4caf50" />',
  '\u{1F555}': '<Ionicons name="time" size={16} />',
  '\u{1F956}': '<Ionicons name="restaurant" size={24} />',
  '\u{1F50B}': '<Ionicons name="battery" size={24} />',
  '\u{26A0}': '<Ionicons name="warning" size={16} color="#f59e0b" />',
  '\u{26A0}\u{FE0F}': '<Ionicons name="warning" size={16} color="#f59e0b" />',
};

function replaceEmojis(content, replacements) {
  let changed = false;
  EMOJIS.forEach(emoji => {
    if (content.includes(emoji)) {
      const rep = replacements[emoji];
      if (rep) {
        content = content.split(emoji).join(rep);
        changed = true;
      }
    }
  });
  return { content, changed };
}

function getNeededIconsLucide(content) {
  const needed = new Set();
  // Match JSX element usage like <IconName ... />
  const jsxRegex = /<([A-Z][A-Za-z0-9]*)\s+[^>]*\/>/g;
  let match;
  const LUCIDE_LIST = [
    'Flame','Hamburger','Pizza','UtensilsCrossed','Wine','Hand','Bell','Search',
    'PartyPopper','Utensils','Star','User','Package','Bike','ClipboardList',
    'Wallet','Home','Gift','WifiOff','Clock','Wifi','Phone','Check','X',
    'AlertCircle','ShoppingCart','Car','CheckCircle','Store','Flag','Zap',
    'Calendar','Trophy','Siren','Truck','ShoppingBag','MapPin','ChevronLeft',
    'RefreshCw','Smartphone','Banknote','CreditCard','Copy','Share2','Crown',
    'ExternalLink','RotateCcw','Trash2','Navigation','AlertTriangle','Handshake',
  ];
  // Build a set of known lucide icon names for matching
  const lucideSet = new Set(LUCIDE_LIST);
  while ((match = jsxRegex.exec(content)) !== null) {
    const tagName = match[1];
    if (lucideSet.has(tagName)) {
      needed.add(tagName);
    }
  }
  return needed;
}

function getNeededIconsIonicons(content) {
  const needed = new Set();
  // Match <Ionicons name="xxx" ... />
  const regex = /<Ionicons\s+name="([^"]+)"[^>]*\/>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    needed.add(match[1]);
  }
  return needed;
}

function addIoniconsImport(content) {
  const names = getNeededIconsIonicons(content);
  if (names.size === 0) return content;
  const sorted = Array.from(names).sort();
  const importLine = "import { Ionicons } from '@expo/vector-icons';\n";
  // Check if already imported
  if (content.includes("@expo/vector-icons")) return content;
  const imports = content.match(/import\s+.*from\s+['"][^'"]+['"];?\n?/g);
  if (imports && imports.length > 0) {
    const last = imports[imports.length - 1];
    content = content.replace(last, last + importLine);
  } else {
    content = importLine + content;
  }
  return content;
}

function addLucideImport(content) {
  const needed = getNeededIconsLucide(content);
  if (needed.size === 0) return content;
  const sorted = Array.from(needed).sort();
  const importLine = "import { " + sorted.join(', ') + " } from 'lucide-react';\n";
  
  const hasLucide = /import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"]/.test(content);
  if (hasLucide) {
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"];?\n?/, importLine);
  } else {
    const imports = content.match(/import\s+.*from\s+['"][^'"]+['"];?\n?/g);
    if (imports && imports.length > 0) {
      const last = imports[imports.length - 1];
      content = content.replace(last, last + importLine);
    } else {
      content = importLine + content;
    }
  }
  return content;
}

let totalFixed = 0;

// Process web files
webFiles.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let c = fs.readFileSync(fp, 'utf8');
  const matches = c.match(emojiPattern);
  if (!matches || matches.length === 0) {
    console.log(fp + ': CLEAN');
    return;
  }
  const unique = [...new Set(matches)];
  console.log(fp + ': ' + matches.length + ' emojis, unique: ' + unique.join(','));
  
  const result = replaceEmojis(c, WEB_REPLACEMENTS);
  if (result.changed) {
    c = addLucideImport(result.content);
    fs.writeFileSync(fp, c);
    totalFixed++;
  }
});

// Process mobile files
mobileFiles.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let c = fs.readFileSync(fp, 'utf8');
  const matches = c.match(emojiPattern);
  if (!matches || matches.length === 0) {
    console.log(fp + ': CLEAN');
    return;
  }
  const unique = [...new Set(matches)];
  console.log(fp + ': ' + matches.length + ' emojis, unique: ' + unique.join(','));
  
  const result = replaceEmojis(c, IONICONS_REPLACEMENTS);
  if (result.changed) {
    c = addIoniconsImport(result.content);
    fs.writeFileSync(fp, c);
    totalFixed++;
  }
});

console.log('\nTotal files fixed: ' + totalFixed);
