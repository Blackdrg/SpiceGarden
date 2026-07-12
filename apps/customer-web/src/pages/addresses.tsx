import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { PlusIcon, Trash2Icon, StarIcon, MapPinIcon, AlertCircleIcon } from 'lucide-react';
import { API_URL } from '@spicegarden/shared/constants';
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
  const { addresses, isLoading, error } = useAddresses();
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
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
        credentials: 'include',
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
    try {
      const res = await fetch(`${API_URL}/addresses/${id}/default`, {
        method: 'PUT',
        headers: {},
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to set default');
      queryClient.setQueryData<Address[]>(['addresses'], prev => (prev || []).map(a => ({ ...a, isDefault: a.id === id })));
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to set default');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: {},
        credentials: 'include',
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
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Saved Addresses</h2>
        <p className={styles.pageSubtitle}>Manage your delivery addresses</p>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          aria-label="Add new address"
          className={styles.addButton}
        >
          <PlusIcon size={22} />
        </button>
      </div>

      {queryErrorText && (
        <div className={`${styles.errorBanner} ${styles.errorBannerActions}`}>
          <AlertCircleIcon size={16} />
          <span>{queryErrorText}</span>
        </div>
      )}
      {actionError && (
        <div className={`${styles.errorBanner} ${styles.errorBannerActions}`}>
          <AlertCircleIcon size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <Card variant="elevated">
          <div className={styles.emptyState}>
            <MapPinIcon size={40} color={DESIGN_TOKENS.colors.textTertiary} style={{ marginBottom: 12 }} />
            <p className={styles.emptyText}>No addresses saved yet. Add one to get started!</p>
          </div>
        </Card>
      ) : (
        addresses.map(addr => (
          <Card key={addr.id} title={addr.label} variant="interactive">
            <div className={styles.addressHeader}>
              <div className={styles.addressInfo}>
                <div className={styles.addressLabel}>{addr.label}</div>
                <div className={styles.addressText}>{addr.addressLine}</div>
                <div className={styles.addressText}>{addr.city}, {addr.state} {addr.postalCode}</div>
                {addr.isDefault && (
                  <span className={styles.defaultBadge}>
                    <StarIcon size={12} fill={DESIGN_TOKENS.colors.primary} color={DESIGN_TOKENS.colors.primary} /> Default
                  </span>
                )}
              </div>
              <div className={styles.addressActions}>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    aria-label="Set as default"
                    className={styles.actionButton}
                    title="Set as default"
                  >
                    <StarIcon size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  aria-label="Delete address"
                  className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                  title="Delete address"
                >
                  <Trash2Icon size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <Card title="Add New Address" variant="elevated">
              <div className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="addr-label" className={styles.formLabel}>Label (e.g., Home, Work)</label>
                  <input
                    id="addr-label"
                    className={styles.formInput}
                    placeholder="Label (e.g., Home, Work)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="addr-address" className={styles.formLabel}>Address Line</label>
                  <input
                    id="addr-address"
                    className={styles.formInput}
                    placeholder="Address Line"
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="addr-city" className={styles.formLabel}>City</label>
                  <input
                    id="addr-city"
                    className={styles.formInput}
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="addr-state" className={styles.formLabel}>State</label>
                  <input
                    id="addr-state"
                    className={styles.formInput}
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="addr-postal" className={styles.formLabel}>Postal Code</label>
                  <input
                    id="addr-postal"
                    className={styles.formInput}
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
        </div>
      )}
    </div>
  );
};

export default function AddressesPageProtected(props: any) {
  return <ProtectedRoute><AddressesPage {...props} /></ProtectedRoute>;
}
