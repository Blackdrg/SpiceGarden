import { useReducer } from 'react';
import { Button, useToast } from '@spicegarden/ui';
import Head from 'next/head';
import styles from './menu.module.css';

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
  const toast = useToast();
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
      toast.showToast({ message: 'Menu saved', type: 'success', duration: 0 });
    } catch (e) {
      toast.showToast({ message: 'Failed to save menu', type: 'error', duration: 0 });
    } finally {
      dispatch({ type: 'loading-changed', loading: false });
    }
  };

  return (
    <div className={styles.container}>
      <Head><title>Menu Setup - Onboarding</title></Head>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Menu Setup</h1>
        <p className={styles.subtitle}>Create your menu categories and add items.</p>

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

        <div className={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding/gst'}
            className={styles.secondaryBtn}
          >
            Back
          </button>
          <Button label={state.loading ? 'Saving...' : 'Save Menu'} onClick={submit} disabled={state.loading} className={styles.secondaryBtn} />
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
    <div className={styles.categoriesSection}>
      <h2 className={styles.sectionHeader}>Categories</h2>
      <div className={styles.flexGap}>
        <input
          aria-label="New category name"
          value={newCat}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="New category"
          className={styles.input}
        />
        <Button label="Add" onClick={onAddCategory} />
      </div>
      <div className={styles.flexGap}>
        {categories.map((cat) => (
          <span key={cat} className={styles.badge}>
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
    <div className={styles.addItemForm}>
      <h2 className={styles.formHeader}>Add Menu Item</h2>
      <div className={styles.grid}>
        <input
          aria-label="Item name"
          value={newItem.name}
          onChange={(e) => onItemChange('name', e.target.value)}
          placeholder="Item name"
          className={styles.input}
        />
        <input
          aria-label="Item price"
          value={newItem.price}
          onChange={(e) => onItemChange('price', e.target.value)}
          placeholder="Price (₹)"
          type="number"
          className={styles.input}
        />
        <select
          aria-label="Item category"
          value={newItem.category}
          onChange={(e) => onItemChange('category', e.target.value)}
          className={styles.input}
        >
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <Button label="Add Item" onClick={onAddItem} className={styles.secondaryBtn} />
    </div>
  );
}

function ItemsList({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className={styles.categoriesSection}>
      <h2 className={styles.sectionHeader}>Menu Items ({items.length})</h2>
      <div className={styles.flexColumn}>
        {items.map((item) => (
          <div key={item.id} className={styles.itemCard}>
            <span>{item.name}</span>
            <span className={styles.itemCategory}>{item.category}</span>
            <span className={styles.itemPrice}>₹{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

