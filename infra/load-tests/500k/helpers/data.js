// infra/load-tests/500k/helpers/data.js

export const SEARCH_QUERIES = [
  'biryani', 'butter chicken', 'paneer tikka', 'masala dosa', 'hyderabadi dum biryani',
  'garlic naan', 'dal makhani', 'tandoori chicken', 'samosa', 'chole bhature',
  'gulab jamun', 'palak paneer', 'mutton rogan josh', 'pav bhaji', 'idli vada',
  'veg pulao', 'chicken tikka masala', 'fish curry', 'kathi roll', 'rasgulla',
  'pizza', 'burger', 'pasta', 'fried rice', 'hakka noodles', 'momos', 'shawarma'
];

export const GEOGRAPHIC_COORDINATES = [
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { city: 'Chennai', lat: 13.0823, lng: 80.2707 },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
];

export const RESTAURANT_SEEDS = [
  { id: 'rest_mumbai_spice_01', slug: 'mumbai-spice-kitchen', name: 'Mumbai Spice Kitchen', branchId: 'branch_mum_01' },
  { id: 'rest_delhi_darbar_02', slug: 'delhi-darbar-bistro', name: 'Delhi Darbar Bistro', branchId: 'branch_del_01' },
  { id: 'rest_bangalore_tiffin_03', slug: 'bangalore-tiffin-house', name: 'Bangalore Tiffin House', branchId: 'branch_blr_01' },
  { id: 'rest_hyderabad_biryani_04', slug: 'hyderabad-nawabi-biryani', name: 'Hyderabad Nawabi Biryani', branchId: 'branch_hyd_01' },
  { id: 'rest_punjab_grill_05', slug: 'royal-punjab-grill', name: 'Royal Punjab Grill', branchId: 'branch_pun_01' },
  { id: 'rest_chennai_cheftable_06', slug: 'chennai-coastal-spice', name: 'Chennai Coastal Spice', branchId: 'branch_chn_01' },
  { id: 'rest_kolkata_rolls_07', slug: 'kolkata-flavour-street', name: 'Kolkata Flavour Street', branchId: 'branch_kol_01' },
  { id: 'rest_pune_bhojanalay_08', slug: 'pune-heritage-bhoj', name: 'Pune Heritage Bhoj', branchId: 'branch_pne_01' }
];

export const MENU_ITEMS_SEEDS = [
  { id: 'item_hyderabadi_biryani_01', name: 'Royal Hyderabadi Dum Biryani', price: 349, category: 'Main Course' },
  { id: 'item_butter_chicken_02', name: 'Classic Butter Chicken Makhani', price: 389, category: 'Curries' },
  { id: 'item_paneer_tikka_03', name: 'Tandoori Paneer Tikka Platter', price: 299, category: 'Starters' },
  { id: 'item_masala_dosa_04', name: 'Ghee Podi Masala Dosa', price: 179, category: 'South Indian' },
  { id: 'item_garlic_naan_05', name: 'Butter Garlic Naan (2 pcs)', price: 99, category: 'Breads' },
  { id: 'item_dal_makhani_06', name: 'Slow Cooked Dal Makhani', price: 249, category: 'Curries' },
  { id: 'item_gulab_jamun_07', name: 'Warm Gulab Jamun (4 pcs)', price: 129, category: 'Desserts' },
  { id: 'item_chicken_tikka_08', name: 'Angara Chicken Tikka Kebab', price: 329, category: 'Starters' }
];

export function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
