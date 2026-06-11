const fs = require('fs');

const c = fs.readFileSync('apps/delivery-partner/App.tsx', 'utf8');
const emojis = c.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
const total = emojis ? emojis.length : 0;
const unique = emojis ? [...new Set(emojis)] : [];
console.log('Total:', total, 'Unique:', unique.length);

// Direct character-by-character replacement
const REPLACEMENTS = new Map();
REPLACEMENTS.set('\u{1F6A7}', '<AlertTriangle size={24} />');
REPLACEMENTS.set('\u{1F4F5}', '<WifiOff size={16} />');
REPLACEMENTS.set('\u{1F50B}', '<Ionicons name="battery" size={24} />');
REPLACEMENTS.set('\u{1F37D}', '<Ionicons name="restaurant" size={24} />');
REPLACEMENTS.set('\u{1F4CD}', '<Ionicons name="location" size={24} />');
REPLACEMENTS.set('\u{1F697}', '<Car size={24} />');
REPLACEMENTS.set('\u{1F389}', '<Ionicons name="rocket" size={24} />');
REPLACEMENTS.set('\u{2705}', '<CheckCircle size={24} color="#4caf50" />');
REPLACEMENTS.set('\u{2757}', '<AlertCircle size={24} color="#ef4444" />');
REPLACEMENTS.set('\u{270B}', '<Hand size={24} />');
REPLACEMENTS.set('\u{1F4CB}', '<ClipboardList size={22} />');
REPLACEMENTS.set('\u{1F6F5}', '<Bike size={64} />');
REPLACEMENTS.set('\u{1F3EA}', '<Store size={24} />');
REPLACEMENTS.set('\u{1F3C1}', '<Flag size={24} />');
REPLACEMENTS.set('\u{1F4C5}', '<Calendar size={24} />');
REPLACEMENTS.set('\u{1F3E0}', '<Home size={22} />');
REPLACEMENTS.set('\u{1F4B0}', '<Wallet size={22} />');
REPLACEMENTS.set('\u{1F6A8}', '<Siren size={24} color="#ef4444" />');
REPLACEMENTS.set('\u{1F69A}', '<Truck size={24} />');
REPLACEMENTS.set('\u{2713}', '<Check size={14} color="#4caf50" />');
REPLACEMENTS.set('\u{1F4DE}', '<Phone size={14} />');
REPLACEMENTS.set('\u{26A1}', '<Zap size={24} />');
REPLACEMENTS.set('\u{26A0}', '<Ionicons name="warning" size={16} color="#f59e0b" />');
REPLACEMENTS.set('\u{1F3C6}', '<Trophy size={24} />');

let result = c;
let fixed = 0;
REPLACEMENTS.forEach((replacement, emoji) => {
  if (result.includes(emoji)) {
    result = result.split(emoji).join(replacement);
    fixed++;
    console.log('  Fixed:', emoji, '->', replacement.substring(0, 30) + '...');
  }
});

fs.writeFileSync('apps/delivery-partner/App.tsx', result);
console.log('Done! Fixed', fixed, 'emoji types');
