const fs = require('fs');
const path = require('path');

const emojiRegex = /\p{Emoji}/gu;

const replacementMap = new Map([
  ['\u{1F525}', '<Flame size={20} color="#f04e31" />'],
  ['\u{1F354}', '<Hamburger size={24} />'],
  ['\u{1F355}', '<Pizza size={24} />'],
  ['\u{1F35F}', '<UtensilsCrossed size={24} />'],
  ['\u{1F9C1}', '<UtensilsCrossed size={24} />'],
  ['\u{1F950}', '<UtensilsCrossed size={24} />'],
  ['\u{1F964}', '<Wine size={24} />'],
  ['\u{1F9C3}', '<Wine size={24} />'],
  ['\u{1F44B}', '<Hand size={20} />'],
  ['\u{1F514}', '<Bell size={18} />'],
  ['\u{1F50D}', '<Search size={18} />'],
  ['\u{1F389}', '<PartyPopper size={24} />'],
  ['\u{1F37D}', '<Utensils size={32} />'],
  ['\u{2B50}', '<Star size={14} fill="#fbbf24" color="#fbbf24" />'],
  ['\u{1F464}', '<User size={48} color="white" />'],
  ['\u{1F4E6}', '<Package size={48} />'],
  ['\u{1F3CD}', '<Bike size={64} />'],
  ['\u{1F4CB}', '<ClipboardList size={22} />'],
  ['\u{1F4B0}', '<Wallet size={22} />'],
  ['\u{1F3E0}', '<Home size={22} />'],
  ['\u{1F381}', '<Gift size={22} />'],
  ['\u{1F4F5}', '<WifiOff size={16} />'],
  ['\u{1F552}', '<Clock size={16} />'],
  ['\u{1F4F6}', '<Wifi size={16} />'],
  ['\u{1F4DE}', '<Phone size={14} />'],
  ['\u{2714}', '<Check size={14} color="#4caf50" />'],
  ['\u{2717}', '<X size={14} color="#ef4444" />'],
  ['\u{26A0}', '<AlertCircle size={16} color="#f59e0b" />'],
  ['\u{2716}', '<X size={14} color="#ef4444" />'],
  ['\u{1F6D2}', '<ShoppingCart size={40} />'],
  ['\u{1F6B6}', '<Car size={24} />'],
  ['\u{2705}', '<CheckCircle size={24} color="#4caf50" />'],
  ['\u{1F3EA}', '<Store size={24} />'],
  ['\u{1F3C1}', '<Flag size={24} />'],
  ['\u{2757}', '<AlertCircle size={24} color="#ef4444" />'],
  ['\u{23F3}', '<Clock size={24} />'],
  ['\u{26A1}', '<Zap size={24} />'],
  ['\u{1F4C5}', '<Calendar size={24} />'],
  ['\u{1F3C6}', '<Trophy size={24} />'],
  ['\u{270B}', '<Hand size={24} />'],
  ['\u{1F6A8}', '<Siren size={24} color="#ef4444" />'],
  ['\u{1F69A}', '<Truck size={24} />'],
  ['\u{1F6CD}', '<ShoppingBag size={24} />'],
]);

const iconNames = new Set();
replacementMap.forEach(v => {
  const m = v.match(/<(\w+)/);
  if (m) iconNames.add(m[1]);
});

const apps = ['customer-web', 'restaurant-dashboard', 'super-admin', 'customer-mobile', 'delivery-partner', 'launcher'];
let totalFiles = 0;

apps.forEach(app => {
  const dir = 'apps/' + app;
  if (!fs.existsSync(dir)) return;
  
  function walk(d) {
    fs.readdirSync(d).forEach(f => {
      const fp = path.join(d, f);
      if (fs.statSync(fp).isDirectory()) {
        if (['node_modules', '.next', 'dist', '__tests__', '.git'].includes(f)) return;
        walk(fp);
      } else if (/\.(tsx?)$/.test(fp) && !f.endsWith('.d.ts')) {
        let c = fs.readFileSync(fp, 'utf8');
        const matches = c.match(emojiRegex);
        if (!matches || matches.length === 0) return;
        
        let newC = c;
        let changed = false;
        const seen = new Set();
        
        for (const emoji of matches) {
          if (seen.has(emoji)) continue;
          seen.add(emoji);
          const replacement = replacementMap.get(emoji);
          if (replacement) {
            newC = newC.split(emoji).join(replacement);
            changed = true;
          }
        }
        
        if (changed) {
          fs.writeFileSync(fp, newC);
          totalFiles++;
          console.log(fp + ': ' + matches.length + ' emojis');
        }
      }
    });
  }
  walk(dir);
});

console.log('\nTotal: ' + totalFiles + ' files');
