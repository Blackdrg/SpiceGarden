import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { Plus, CreditCard, Trash2, Star, AlertCircle } from 'lucide-react';
import { API_URL } from '@spicegarden/shared/constants';
import { getCachedToken } from '../utils/cachedLocalStorage';
import styles from './payment-methods.module.css';
import ProtectedRoute from '../components/ProtectedRoute';

interface PaymentMethod {
  id: string;
  type: string;
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  upiId?: string;
  isDefault: boolean;
}

const PaymentMethodsPage = () => {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'card',
    cardLast4: '',
    cardBrand: '',
    cardExpiry: '',
    upiId: '',
  });

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const token = getCachedToken();
        if (!token || token === 'demo-token') {
          return;
        }
        
        const res = await fetch(`${API_URL}/payment-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setMethods(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };
    loadMethods();
  }, [router]);

  const handleAddMethod = async () => {
    const token = getCachedToken();
    if (!token || token === 'demo-token') return;
    
    try {
      const res = await fetch(`${API_URL}/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newMethod),
      });
      
      if (!res.ok) throw new Error('Failed to add payment method');
      
      const added = await res.json();
      setMethods([...methods, added]);
      setShowAddForm(false);
      setNewMethod({ type: 'card', cardLast4: '', cardBrand: '', cardExpiry: '', upiId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = getCachedToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/payment-methods/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to set default');
      setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default');
    }
  };

  const handleDelete = async (id: string) => {
    const token = getCachedToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      setMethods(methods.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Payment Methods</h2>
        <button type="button" onClick={() => setShowAddForm(true)} aria-label="Add payment method">
          <Plus size={24} />
        </button>
      </div>

      {methods.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No payment methods saved yet. Add one to get started!</p>
        </div>
      ) : (
        methods.map(method => (
          <Card key={method.id} title={method.type === 'card' ? `${method.cardBrand || 'Card'} •••• ${method.cardLast4 || '****'}` : `UPI • ${method.upiId || '****'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {method.type === 'card' && method.cardExpiry && (
                  <p style={{ margin: 0, fontSize: '14px' }}>Expires {method.cardExpiry}</p>
                )}
                {method.isDefault && (
                  <span style={{ color: DESIGN_TOKENS.colors.primary, fontSize: '12px' }}>
                    <Star size={12} fill={DESIGN_TOKENS.colors.primary} /> Default
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.xs }}>
                {!method.isDefault && (
                  <button type="button" onClick={() => handleSetDefault(method.id)} aria-label="Set as default">
                    <Star size={16} />
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(method.id)} aria-label="Delete" className={styles.deleteButton}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {showAddForm && (
        <div className={styles.modalOverlay}>
          <Card title="Add Payment Method">
            <div className={styles.form}>
              <select
                className={styles.select}
                value={newMethod.type}
                onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
              </select>
              {newMethod.type === 'card' && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="pm-card-brand" className={styles.label}>Card Brand (Visa, Mastercard)</label>
                    <input 
                      id="pm-card-brand"
                      className={styles.input}
                      placeholder="Card Brand (Visa, Mastercard)" 
                      value={newMethod.cardBrand} 
                      onChange={(e) => setNewMethod({ ...newMethod, cardBrand: e.target.value })} 
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="pm-card-last4" className={styles.label}>Last 4 digits</label>
                    <input 
                      id="pm-card-last4"
                      className={styles.input}
                      placeholder="Last 4 digits" 
                      value={newMethod.cardLast4} 
                      onChange={(e) => setNewMethod({ ...newMethod, cardLast4: e.target.value })} 
                      maxLength={4} 
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="pm-card-expiry" className={styles.label}>Expiry (MM/YY)</label>
                    <input 
                      id="pm-card-expiry"
                      className={styles.input}
                      placeholder="Expiry (MM/YY)" 
                      value={newMethod.cardExpiry} 
                      onChange={(e) => setNewMethod({ ...newMethod, cardExpiry: e.target.value })} 
                    />
                  </div>
                </div>
              )}
              {newMethod.type === 'upi' && (
                <div className={styles.fieldGroup}>
                  <label htmlFor="pm-upi-id" className={styles.label}>UPI ID (example@upi)</label>
                  <input 
                    id="pm-upi-id"
                    className={styles.input}
                    placeholder="UPI ID (example@upi)" 
                    value={newMethod.upiId} 
                    onChange={(e) => setNewMethod({ ...newMethod, upiId: e.target.value })} 
                  />
                </div>
              )}
              <div className={styles.formActions}>
                <Button label="Cancel" onClick={() => setShowAddForm(false)} variant="secondary" />
                <Button label="Save" onClick={handleAddMethod} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><PaymentMethodsPage {...props} /></ProtectedRoute>;
}