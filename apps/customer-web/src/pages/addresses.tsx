import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { Plus, MapPin, Trash2, Star, AlertCircle } from 'lucide-react';
import { API_URL } from '@spicegarden/shared/constants';

interface Address {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

const AddressesPage = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = localStorage.getItem('sg_token:v1');
        if (!token || token === 'demo-token') {
          router.push('/auth');
          return;
        }
        
        const res = await fetch(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to load addresses');
        }
        setAddresses(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, [router]);

  const handleAddAddress = async () => {
    const token = localStorage.getItem('sg_token:v1');
    if (!token || token === 'demo-token') return;
    
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAddress),
      });
      
      if (!res.ok) throw new Error('Failed to add address');
      
      const added = await res.json();
      setAddresses([...addresses, added]);
      setShowAddForm(false);
      setNewAddress({ label: '', addressLine: '', city: '', state: '', postalCode: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add address');
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = localStorage.getItem('sg_token:v1');
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to set default');
      setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default');
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('sg_token:v1');
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading addresses...</p>
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
        <h2 style={{ margin: 0 }}>Saved Addresses</h2>
        <button type="button" onClick={() => setShowAddForm(true)} aria-label="Add new address">
          <Plus size={24} />
        </button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing.xl }}>
          <p style={{ color: '#666' }}>No addresses saved yet. Add one to get started!</p>
        </div>
      ) : (
        addresses.map(addr => (
          <Card key={addr.id} title={addr.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0 }}>{addr.addressLine}</p>
                <p style={{ margin: '4px 0', color: '#666' }}>{addr.city}, {addr.state} {addr.postalCode}</p>
                {addr.isDefault && (
                  <span style={{ color: DESIGN_TOKENS.colors.primary, fontSize: '12px' }}>
                    <Star size={12} fill={DESIGN_TOKENS.colors.primary} /> Default
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.xs }}>
                {!addr.isDefault && (
                  <button type="button" onClick={() => handleSetDefault(addr.id)} aria-label="Set as default">
                    <Star size={16} />
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(addr.id)} aria-label="Delete address" style={{ color: DESIGN_TOKENS.colors.danger }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <Card title="Add New Address">
            <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm, padding: DESIGN_TOKENS.spacing.md, minWidth: '400px' }}>
              <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                <label htmlFor="addr-label" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Label (e.g., Home, Work)</label>
                <input
                  id="addr-label"
                  placeholder="Label (e.g., Home, Work)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                <label htmlFor="addr-address" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Address Line</label>
                <input
                  id="addr-address"
                  placeholder="Address Line"
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                <label htmlFor="addr-city" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>City</label>
                <input
                  id="addr-city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}>
                <label htmlFor="addr-state" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>State</label>
                <input
                  id="addr-state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              <label htmlFor="addr-postal" style={{ fontSize: 13, fontWeight: 500 }}>Postal Code</label>
              <input
                id="addr-postal"
                placeholder="Postal Code"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
              <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, marginTop: DESIGN_TOKENS.spacing.md }}>
                <Button label="Cancel" onClick={() => setShowAddForm(false)} variant="secondary" />
                <Button label="Save" onClick={handleAddAddress} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;