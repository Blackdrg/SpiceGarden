import { useReducer } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

type MenuItem = {
  id: string;
  name: string;
  price: string;
  category: string;
};

type MenuState = {
  categories: string[];
  items: MenuItem[];
  newCat: string;
  newItem: { name: string; price: string; category: string };
  loading: boolean;
};

type MenuAction =
  | { type: 'category-added'; category: string }
  | { type: 'new-category-changed'; value: string }
  | { type: 'new-item-changed'; field: keyof MenuState['newItem']; value: string }
  | { type: 'item-added'; item: MenuItem }
  | { type: 'loading-changed'; loading: boolean };

function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'category-added':
      return {
        ...state,
        categories: [...state.categories, action.category],
        newCat: '',
        newItem: { ...state.newItem, category: action.category },
      };
    case 'new-category-changed':
      return { ...state, newCat: action.value };
    case 'new-item-changed':
      return { ...state, newItem: { ...state.newItem, [action.field]: action.value } };
    case 'item-added':
      return { ...state, items: [...state.items, action.item], newItem: { ...state.newItem, name: '', price: '' } };
    case 'loading-changed':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

function createInitialState(): MenuState {
  return {
    categories: ['Main Course', 'Beverages'],
    items: [],
    newCat: '',
    newItem: { name: '', price: '', category: 'Main Course' },
    loading: false,
  };
}

export default function OnboardingMenu() {
  const [state, dispatch] = useReducer(menuReducer, undefined, createInitialState);

  const addCategory = () => {
    const category = state.newCat.trim();
    if (category) dispatch({ type: 'category-added', category });
  };

  const addItem = () => {
    if (state.newItem.name && state.newItem.price) {
      dispatch({
        type: 'item-added',
        item: { ...state.newItem, id: `${state.newItem.name}-${Date.now()}` },
      });
    }
  };

  const submit = async () => {
    dispatch({ type: 'loading-changed', loading: true });
    try {
      const res = await fetch('/api/restaurant-onboarding/step/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'MENU_SETUP',
          data: { categories: state.categories, items: state.items },
        }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Menu saved');
    } catch (e) {
      alert('Failed to save menu');
    } finally {
      dispatch({ type: 'loading-changed', loading: false });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Menu Setup - Onboarding</title></Head>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Menu Setup</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Create your menu categories and add items.</p>

        <CategoriesSection
          categories={state.categories}
          newCat={state.newCat}
          onCategoryChange={(value) => dispatch({ type: 'new-category-changed', value })}
          onAddCategory={addCategory}
        />

        <AddItemForm
          categories={state.categories}
          newItem={state.newItem}
          onItemChange={(field, value) => dispatch({ type: 'new-item-changed', field, value })}
          onAddItem={addItem}
        />

        <ItemsList items={state.items} />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding/gst'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button label={state.loading ? 'Saving...' : 'Save Menu'} onClick={submit} disabled={state.loading} style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

function CategoriesSection({
  categories,
  newCat,
  onCategoryChange,
  onAddCategory,
}: {
  categories: string[];
  newCat: string;
  onCategoryChange: (value: string) => void;
  onAddCategory: () => void;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Categories</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          aria-label="New category name"
          value={newCat}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="New category"
          style={{ flex: 1, padding: '8px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
        />
        <Button label="Add" onClick={onAddCategory} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <span key={cat} style={{ background: '#f9731620', border: '1px solid #f97316', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

function AddItemForm({
  categories,
  newItem,
  onItemChange,
  onAddItem,
}: {
  categories: string[];
  newItem: { name: string; price: string; category: string };
  onItemChange: (field: keyof typeof newItem, value: string) => void;
  onAddItem: () => void;
}) {
  return (
    <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Add Menu Item</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <input
          aria-label="Item name"
          value={newItem.name}
          onChange={(e) => onItemChange('name', e.target.value)}
          placeholder="Item name"
          style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
        />
        <input
          aria-label="Item price"
          value={newItem.price}
          onChange={(e) => onItemChange('price', e.target.value)}
          placeholder="Price (₹)"
          type="number"
          style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
        />
        <select
          aria-label="Item category"
          value={newItem.category}
          onChange={(e) => onItemChange('category', e.target.value)}
          style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
        >
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <Button label="Add Item" onClick={onAddItem} style={{ marginTop: 12 }} />
    </div>
  );
}

function ItemsList({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Menu Items ({items.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => (
          <div key={item.id} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 6, padding: '10px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.name}</span>
            <span style={{ color: '#a1a1aa' }}>{item.category}</span>
            <span style={{ color: '#f97316', fontWeight: 600 }}>₹{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const buttonStyle = {
  primary: { padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  secondary: { padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};
