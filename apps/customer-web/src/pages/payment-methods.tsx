import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { Plus, CreditCard, Trash2, Star, AlertCircle } from 'lucide-react';
import { API_URL } from '@spicegarden/shared/constants';

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
        const token = localStorage.getItem('sg_token:v1');
        if (!token || token === 'demo-token') {
          router.push('/auth');
          return;
        }
        
        const res = await fetch(`${API_URL}/payment-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to load payment methods');
        }
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
    const token = localStorage.getItem('sg_token:v1');
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
    const token = localStorage.getItem('sg_token:v1');
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
    const token = localStorage.getItem('sg_token:v1');
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
      <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral }}>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.sm, backgroundColor: '#ffebee', color: '#c62828', padding: DESIGN_TOKENS.spacing.md, borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: DESIGN_TOKENS.spacing.lg }}>
        <h2 style={{ margin: 0 }}>Payment Methods</h2>
        <button type="button" onClick={() => setShowAddForm(true)} aria-label="Add payment method">
          <Plus size={24} />
        </button>
      </div>

      {methods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing.xl }}>
          <p style={{ color: '#666' }}>No payment methods saved yet. Add one to get started!</p>
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
                <button type="button" onClick={() => handleDelete(method.id)} aria-label="Delete" style={{ color: DESIGN_TOKENS.colors.danger }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <Card title="Add Payment Method">
            <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm, padding: DESIGN_TOKENS.spacing.md, minWidth: '400px' }}>
              <select
                value={newMethod.type}
                onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
              </select>
              {newMethod.type === 'card' && (
                <div>
                  <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                    <label htmlFor="pm-card-brand" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Card Brand (Visa, Mastercard)</label>
                    <input 
                      id="pm-card-brand"
                      placeholder="Card Brand (Visa, Mastercard)" 
                      value={newMethod.cardBrand} 
                      onChange={(e) => setNewMethod({ ...newMethod, cardBrand: e.target.value })} 
                      style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }} 
                    />
                  </div>
                  <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                    <label htmlFor="pm-card-last4" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Last 4 digits</label>
                    <input 
                      id="pm-card-last4"
                      placeholder="Last 4 digits" 
                      value={newMethod.cardLast4} 
                      onChange={(e) => setNewMethod({ ...newMethod, cardLast4: e.target.value })} 
                      maxLength={4} 
                      style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }} 
                    />
                  </div>
                  <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                    <label htmlFor="pm-card-expiry" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Expiry (MM/YY)</label>
                    <input 
                      id="pm-card-expiry"
                      placeholder="Expiry (MM/YY)" 
                      value={newMethod.cardExpiry} 
                      onChange={(e) => setNewMethod({ ...newMethod, cardExpiry: e.target.value })} 
                      style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }} 
                    />
                  </div>
                </div>
              )}
              {newMethod.type === 'upi' && (
                <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                  <label htmlFor="pm-upi-id" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>UPI ID (example@upi)</label>
                  <input 
                    id="pm-upi-id"
                    placeholder="UPI ID (example@upi)" 
                    value={newMethod.upiId} 
                    onChange={(e) => setNewMethod({ ...newMethod, upiId: e.target.value })} 
                    style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }} 
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, marginTop: DESIGN_TOKENS.spacing.md }}>
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

export default PaymentMethodsPage;