const fs = require('fs');
const EMOJIS = ['🔥','🍔','🍕','🍟','🧅','🥖','🥤','🧃','👋','🔔','🔍','🎉','🍽️','⭐','👤','📦','🛵','📋','💰','🏠','🎁','📵','🕒','📶','📞','✓','✗','⚠️','✕','🛒','🚧','⏰','📍','🚗','✅','🏪','📅','🏆','✋','🚨','🚚','🛍️','🏁','❗','⏳','⚡','🤝'];
const pattern = new RegExp(EMOJIS.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const c = fs.readFileSync('apps/delivery-partner/App.tsx','utf8');
const m = c.match(pattern);
if (m) {
  const unique = [...new Set(m)];
  console.log('Matches:', m.length, 'Unique:', unique.length);
  unique.forEach(e => {
    const cp = [...e].map(ch => 'U+'+ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join('');
    console.log('  ' + e + ' (' + cp + ')');
  });
} else {
  console.log('NO MATCH - CLEAN');
}
