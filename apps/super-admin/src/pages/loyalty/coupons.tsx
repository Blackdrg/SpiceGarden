import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spicegarden/ui';
import styles from './coupons.module.css';
import Head from 'next/head';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Coupon {
  id: string;
  code: string;
  type: string;
  status?: string;
  usageCount?: number;
  usageLimit?: number;
}

export default function LoyaltyCoupons() {
  const [form, setForm] = useState({ code: '', type: 'percentage', discountValue: '', usageLimit: '' });
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading: loading } = useQuery<Coupon[]>({
    queryKey: ['loyalty-coupons'],
    queryFn: async () => {
      const response = await fetch(`${API}/loyalty/coupons`);
      if (!response.ok) throw new Error('Failed to load coupons');
      return response.json() as Promise<Coupon[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      const response = await fetch(`${API}/loyalty/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create coupon');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-coupons'] });
    },
  });

  const createCoupon = async () => {
    setCreating(true);
    await createMutation.mutateAsync({
      ...form,
      discountValue: parseFloat(form.discountValue),
      usageLimit: parseInt(form.usageLimit),
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 86400000),
    });
    setForm({ code: '', type: 'percentage', discountValue: '', usageLimit: '' });
    setCreating(false);
    toast.showToast({ message: 'Coupon created successfully', type: 'success', duration: 0 });
  };

  const activeCoupons = coupons.filter((c) => c.status === 'active');

  return (
    <div className={styles.container}>
      <Head><title>Coupon Management - SpiceGarden</title></Head>
      <h1 className={styles.title}>Coupon Management</h1>

      <div className={styles.formCard}>
        <h2 className={styles.formLabel}>Create New Coupon</h2>
        <div>
          <input
            id="coupon-code"
            aria-label="Coupon code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Coupon code (e.g. SAVE20)"
            className={styles.input}
          />
          <select
            id="coupon-type"
            aria-label="Coupon type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={styles.input}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
          <input
            id="discount-value"
            aria-label="Discount value"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            placeholder="Discount value"
            type="number"
            className={styles.input}
          />
          <input
            id="usage-limit"
            aria-label="Usage limit"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            placeholder="Usage limit"
            type="number"
            className={styles.input}
          />
          <button
            type="button"
            onClick={createCoupon}
            disabled={creating}
            className={styles.button}
          >
            {creating ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Active Coupons ({coupons.length})</h2>
      {loading ? (
        <p className={styles.loadingText}>Loading...</p>
      ) : (
        <div className={styles.listContainer}>
          {activeCoupons.map((c) => (
            <div key={c.id} className={styles.couponCard}>
              <div>
                <span className={styles.couponCode}>{c.code}</span>
                <span className={styles.couponInfo}>{c.type} · Used {c.usageCount || 0}/{c.usageLimit || 0}</span>
              </div>
              <span className={styles.activeBadge}>Active</span>
            </div>
          ))}
          {coupons.filter((c) => c.status === 'active').length === 0 && (
            <p className={styles.noActiveText}>No active coupons</p>
          )}
        </div>
      )}
      <Link href="/loyalty" className={styles.backLink}>← Back</Link>
    </div>
  );
}
