import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Trash2, Check, Star, MapPin, Building, Home, Briefcase } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
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

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    addressLine: 'Flat 402, Royal Palms, Sector 17',
    city: 'Chandigarh',
    state: 'Punjab',
    postalCode: '160017',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work / Tech Park',
    addressLine: 'Tower B, Tech Hub, Phase 8',
    city: 'Mohali',
    state: 'Punjab',
    postalCode: '160071',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('Chandigarh');
  const [newPostal, setNewPostal] = useState('160017');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sg_saved_addresses');
      if (stored) {
        try {
          setAddresses(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const saveToStorage = (list: Address[]) => {
    setAddresses(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sg_saved_addresses', JSON.stringify(list));
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this saved address?')) {
      const updated = addresses.filter((a) => a.id !== id);
      saveToStorage(updated);
    }
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      addressLine: newAddressLine,
      city: newCity,
      state: 'Punjab',
      postalCode: newPostal,
      isDefault: addresses.length === 0,
    };

    saveToStorage([...addresses, newAddr]);
    setShowAddModal(false);
    setNewAddressLine('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 60 }}>
      <Head>
        <title>Saved Addresses | SpiceGarden</title>
      </Head>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 32px' }}>
        {/* Header */}
        <PageHeader
          title="Saved Addresses"
          actionLabel="Add Address"
          onAction={() => setShowAddModal(true)}
        />

        {/* Addresses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: addr.isDefault ? '1.5px solid #ff5a1f' : '1px solid #e2e8f0',
                padding: '18px 20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {addr.label.toLowerCase().includes('home') ? <Home size={16} /> : <Briefcase size={16} />}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{addr.label}</h2>
                  {addr.isDefault && (
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                      DEFAULT
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                  title="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p style={{ margin: '0 0 4px 0', fontSize: 14, color: '#334155' }}>{addr.addressLine}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{addr.city}, {addr.state} - {addr.postalCode}</p>

              {!addr.isDefault && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ff5a1f', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Set as Default Delivery Address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Address Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Add New Delivery Address</h3>
              <form onSubmit={handleCreateAddress}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Tag as</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Home', 'Work', 'Other'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setNewLabel(tag)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: newLabel === tag ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                          background: newLabel === tag ? '#fff7ed' : '#f8fafc',
                          color: newLabel === tag ? '#ea580c' : '#475569',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>House / Flat / Street Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 301, Tower 4, Royal Palms"
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>City</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>PIN Code</label>
                    <input
                      type="text"
                      value={newPostal}
                      onChange={(e) => setNewPostal(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, padding: 12, borderRadius: 10, background: '#f1f5f9', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: 12, borderRadius: 10, background: '#ff5a1f', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}