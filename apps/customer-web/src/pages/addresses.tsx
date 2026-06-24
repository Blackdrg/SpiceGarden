import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { Plus, Trash2, Star, AlertCircle } from 'lucide-react';
import { API_URL } from '@spicegarden/shared/constants';
import { getCachedToken } from '../utils/cachedLocalStorage';
import { useAddresses } from '../hooks/useAddresses';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './addresses.module.css';

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
  const queryClient = useQueryClient();
  const token = getCachedToken();
  const safeToken = token && token !== 'demo-token' ? token : null;
  const { addresses, isLoading, error } = useAddresses(safeToken);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const loading = isLoading;
  const queryErrorText = error instanceof Error ? error.message : (error ? 'Failed to load addresses' : null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddAddress = async () => {
    const token = getCachedToken();
    if (!token || token === 'demo-token') return;
    
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAddress),
      });
      
      if (!res.ok) throw new Error('Failed to add address');
      
      const added = await res.json();
      queryClient.setQueryData<Address[]>(['addresses'], prev => [...(prev || []), added]);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddForm(false);
      setNewAddress({ label: '', addressLine: '', city: '', state: '', postalCode: '' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add address');
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = getCachedToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to set default');
      queryClient.setQueryData<Address[]>(['addresses'], prev => (prev || []).map(a => ({ ...a, isDefault: a.id === id })));
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to set default');
    }
  };

  const handleDelete = async (id: string) => {
    const token = getCachedToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      queryClient.setQueryData<Address[]>(['addresses'], prev => (prev || []).filter(a => a.id !== id));
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {queryErrorText && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{queryErrorText}</span>
        </div>
      )}
      {actionError && (
        <div className={`${styles.errorBanner} ${styles.errorBannerActions}`}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}
      
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Saved Addresses</h2>
        <button type="button" onClick={() => setShowAddForm(true)} aria-label="Add new address">
          <Plus size={24} />
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No addresses saved yet. Add one to get started!</p>
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
                <button type="button" onClick={() => handleDelete(addr.id)} aria-label="Delete address" className={styles.deleteButton}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {showAddForm && (
        <div className={styles.modalOverlay}>
          <Card title="Add New Address">
            <div className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="addr-label" className={styles.label}>Label (e.g., Home, Work)</label>
                <input
                  id="addr-label"
                  className={styles.input}
                  placeholder="Label (e.g., Home, Work)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="addr-address" className={styles.label}>Address Line</label>
                <input
                  id="addr-address"
                  className={styles.input}
                  placeholder="Address Line"
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="addr-city" className={styles.label}>City</label>
                <input
                  id="addr-city"
                  className={styles.input}
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="addr-state" className={styles.label}>State</label>
                <input
                  id="addr-state"
                  className={styles.input}
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="addr-postal" className={styles.label}>Postal Code</label>
                <input
                  id="addr-postal"
                  className={styles.input}
                  placeholder="Postal Code"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                />
              </div>
              <div className={styles.formActions}>
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

export default function AddressesPageProtected(props: any) {
  return <ProtectedRoute><AddressesPage {...props} /></ProtectedRoute>;
}