const fs = require('fs');
const path = require('path');

const iconPattern = /<([A-Z][a-zA-Z]+)/g;
const knownLucideIcons = new Set(['Flame','Hamburger','Pizza','UtensilsCrossed','Wine','Hand','Bell','Search','PartyPopper','Utensils','Star','User','Package','Bike','ClipboardList','Wallet','Home','Gift','WifiOff','Clock','Wifi','Phone','Check','X','AlertCircle','ShoppingCart','Car','CheckCircle','Store','Flag','Zap','Calendar','Trophy','Siren','Truck','ShoppingBag','MapPin','ChevronLeft','RefreshCw','Smartphone','Banknote','CreditCard','Copy','Share2','Crown','ExternalLink','RotateCcw','Trash2','Navigation']);

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
  'apps/customer-mobile/App.tsx',
  'apps/customer-mobile/src/components/EmptyState.tsx',
];

files.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let c = fs.readFileSync(fp, 'utf8');
  const used = new Set();
  let m;
  while ((m = iconPattern.exec(c)) !== null) {
    const name = m[1];
    if (knownLucideIcons.has(name)) used.add(name);
  }
  if (used.size === 0) return;
  
  const sorted = Array.from(used).sort();
  const importLine = "import { " + sorted.join(', ') + " } from 'lucide-react';\n";
  
  const hasLucideImport = /import\s*\{[^}]*\}\s*from\s*['\"]lucide-react['\"]/.test(c);
  if (hasLucideImport) {
    c = c.replace(/import\s*\{[^}]*\}\s*from\s*['\"]lucide-react['\"];?\n?/, importLine);
  } else {
    const lastImport = c.match(/import.*from.*['\"][^'\"]+['\"];?\n?/g);
    if (lastImport && lastImport.length > 0) {
      const last = lastImport[lastImport.length - 1];
      c = c.replace(last, last + importLine);
    } else {
      c = importLine + c;
    }
  }
  
  fs.writeFileSync(fp, c);
  console.log(fp + ': added ' + sorted.length + ' icon imports');
});
