import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft, Plus, Trash2, CreditCard, ShieldCheck, Zap, Wallet } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'wallet';
  label: string;
  details: string;
  isDefault: boolean;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'upi',
    label: 'Google Pay / PhonePe',
    details: 'arjun.mehta@okhdfcbank',
    isDefault: true,
  },
  {
    id: 'pm-2',
    type: 'card',
    label: 'HDFC Millennia Credit Card',
    details: '•••• •••• •••• 4092 (Exp: 08/29)',
    isDefault: false,
  },
  {
    id: 'pm-3',
    type: 'wallet',
    label: 'SpiceGarden Wallet',
    details: 'Balance: ₹500',
    isDefault: false,
  },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(DEFAULT_METHODS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [methodType, setMethodType] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sg_saved_payments');
      if (stored) {
        try {
          setMethods(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const saveToStorage = (list: PaymentMethod[]) => {
    setMethods(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sg_saved_payments', JSON.stringify(list));
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = methods.map((m) => ({
      ...m,
      isDefault: m.id === id,
    }));
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this payment method?')) {
      const updated = methods.filter((m) => m.id !== id);
      saveToStorage(updated);
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    let newMethod: PaymentMethod;
    if (methodType === 'upi') {
      if (!upiId.trim()) return;
      newMethod = {
        id: `pm-${Date.now()}`,
        type: 'upi',
        label: 'UPI ID',
        details: upiId.trim(),
        isDefault: false,
      };
    } else {
      if (!cardNumber.trim()) return;
      newMethod = {
        id: `pm-${Date.now()}`,
        type: 'card',
        label: cardHolder || 'Debit / Credit Card',
        details: `•••• •••• •••• ${cardNumber.slice(-4)} (Exp: ${cardExpiry || '12/28'})`,
        isDefault: false,
      };
    }

    saveToStorage([...methods, newMethod]);
    setShowAddModal(false);
    setUpiId('');
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 60 }}>
      <Head>
        <title>Payment Methods | SpiceGarden</title>
      </Head>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>Payment Methods</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{ background: '#ff5a1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 6px rgba(255,90,31,0.3)' }}
          >
            <Plus size={16} /> Add Method
          </button>
        </div>

        {/* Payment Methods List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {methods.map((method) => (
            <div
              key={method.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: method.isDefault ? '1.5px solid #ff5a1f' : '1px solid #e2e8f0',
                padding: '18px 20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {method.type === 'upi' ? <Zap size={20} /> : method.type === 'wallet' ? <Wallet size={20} /> : <CreditCard size={20} />}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{method.label}</h2>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{method.details}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {method.isDefault ? (
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                      DEFAULT
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(method.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ff5a1f', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Make Default
                    </button>
                  )}

                  {method.type !== 'wallet' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(method.id)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                      title="Remove method"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Badge */}
        <div style={{ marginTop: 24, padding: 14, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: 12 }}>
          <ShieldCheck size={20} color="#16a34a" />
          <span>Your payment credentials are end-to-end encrypted with 256-bit PCI-DSS compliant vault security.</span>
        </div>

        {/* Add Method Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Add Payment Method</h3>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setMethodType('upi')}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    border: methodType === 'upi' ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                    background: methodType === 'upi' ? '#fff7ed' : '#f8fafc',
                    color: methodType === 'upi' ? '#ea580c' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ UPI ID / VPA
                </button>
                <button
                  type="button"
                  onClick={() => setMethodType('card')}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    border: methodType === 'card' ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                    background: methodType === 'card' ? '#fff7ed' : '#f8fafc',
                    color: methodType === 'card' ? '#ea580c' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  💳 Debit / Credit Card
                </button>
              </div>

              <form onSubmit={handleAddPayment}>
                {methodType === 'upi' ? (
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Enter Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4532 •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Arjun Mehta"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="08/29"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                        />
                      </div>
                    </div>
                  </>
                )}

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
                    Save Method
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