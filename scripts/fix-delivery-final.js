const fs = require('fs');

const EMOJI_MAP = new Map();
EMOJI_MAP.set('🚧', '<AlertTriangle size={24} />');
EMOJI_MAP.set('📵', '<WifiOff size={16} />');
EMOJI_MAP.set('🔋', '<Ionicons name="battery" size={24} />');
EMOJI_MAP.set('🍽️', '<Ionicons name="restaurant" size={24} />');
EMOJI_MAP.set('🍽', '<Ionicons name="restaurant" size={24} />');
EMOJI_MAP.set('📍', '<Ionicons name="location" size={24} />');
EMOJI_MAP.set('🚗', '<Car size={24} />');
EMOJI_MAP.set('🎉', '<Ionicons name="rocket" size={24} />');
EMOJI_MAP.set('✅', '<CheckCircle size={24} color="#4caf50" />');
EMOJI_MAP.set('❗', '<AlertCircle size={24} color="#ef4444" />');
EMOJI_MAP.set('✋', '<Hand size={24} />');
EMOJI_MAP.set('📋', '<ClipboardList size={22} />');
EMOJI_MAP.set('🛵', '<Bike size={64} />');
EMOJI_MAP.set('🏪', '<Store size={24} />');
EMOJI_MAP.set('🏁', '<Flag size={24} />');
EMOJI_MAP.set('📅', '<Calendar size={24} />');
EMOJI_MAP.set('🏠', '<Home size={22} />');
EMOJI_MAP.set('💰', '<Wallet size={22} />');
EMOJI_MAP.set('🚨', '<Siren size={24} color="#ef4444" />');
EMOJI_MAP.set('🚚', '<Truck size={24} />');
EMOJI_MAP.set('✓', '<Check size={14} color="#4caf50" />');
EMOJI_MAP.set('📞', '<Phone size={14} />');
EMOJI_MAP.set('⏳', '<Clock size={24} />');
EMOJI_MAP.set('⚡', '<Zap size={24} />');
EMOJI_MAP.set('⚠️', '<Ionicons name="warning" size={16} color="#f59e0b" />');
EMOJI_MAP.set('⚠', '<Ionicons name="warning" size={16} color="#f59e0b" />');
EMOJI_MAP.set('⭐', '<Ionicons name="star" size={14} color="#fbbf24" />');
EMOJI_MAP.set('🏆', '<Trophy size={24} />');
EMOJI_MAP.set('⏰', '<Clock size={24} />');
EMOJI_MAP.set('📦', '<Package size={48} />');

const c = fs.readFileSync('apps/delivery-partner/App.tsx', 'utf8');

// First pass: replace all emojis using regex with Unicode flag
const emojiKeys = Array.from(EMOJI_MAP.keys());
const emojiPattern = new RegExp(emojiKeys.map(e => {
  const escaped = e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped;
}).join('|'), 'gu');

let result = c;
let match;
const emojiPattern2 = new RegExp(emojiKeys.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu');
while ((match = emojiPattern2.exec(result)) !== null) {
  const emoji = match[0];
  const replacement = EMOJI_MAP.get(emoji);
  if (replacement) {
    result = result.split(emoji).join(replacement);
  }
}

// Second pass: remove any orphaned FE0F variation selectors
result = result.split('\uFE0F').join('');

fs.writeFileSync('apps/delivery-partner/App.tsx', result);

// Verify
const final = fs.readFileSync('apps/delivery-partner/App.tsx', 'utf8');
const remaining = final.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/gu);
console.log('After fix - remaining emoji-like chars:', remaining ? remaining.length : 0);
console.log('Has Ionicons:', final.includes('Ionicons'));
console.log('Has @expo/vector-icons:', final.includes('@expo/vector-icons'));
console.log('Has lucide-react:', final.includes('lucide-react'));
