const fs = require('fs');

// Fix menu.tsx - 🥖 (U+1F956) in Garlic Bread image field
let c = fs.readFileSync('apps/customer-web/src/pages/menu.tsx', 'utf8');
c = c.split(String.fromCodePoint(0x1F956)).join('<UtensilsCrossed size={24} />');
fs.writeFileSync('apps/customer-web/src/pages/menu.tsx', c);
console.log('menu.tsx fixed');

// Fix SearchScreen.tsx
c = fs.readFileSync('apps/customer-mobile/src/screens/SearchScreen.tsx', 'utf8');
c = c.split(String.fromCodePoint(0x1F355)).join('<Ionicons name="pizza" size={24} />');
c = c.split(String.fromCodePoint(0x1F552)).join('<Ionicons name="time" size={16} />');
c = c.split(String.fromCodePoint(0x2699)).join('<Ionicons name="settings" size={16} />');
fs.writeFileSync('apps/customer-mobile/src/screens/SearchScreen.tsx', c);
console.log('SearchScreen.tsx fixed');

// Fix CartScreen.tsx
c = fs.readFileSync('apps/customer-mobile/src/screens/CartScreen.tsx', 'utf8');
c = c.split(String.fromCodePoint(0x2715)).join('<Ionicons name="close-circle" size={14} color="#ef4444" />');
c = c.split(String.fromCodePoint(0x26A0)).join('<Ionicons name="warning" size={16} color="#f59e0b" />');
fs.writeFileSync('apps/customer-mobile/src/screens/CartScreen.tsx', c);
console.log('CartScreen.tsx fixed');
