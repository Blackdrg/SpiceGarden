import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ArrowUpDown, Flame, TrendingUp, Sparkles } from 'lucide-react';

interface TopDish {
  dishId: string;
  name: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  uniqueCustomers: number;
  growth: string;
}

const SEED_TOP_DISHES: TopDish[] = [
  { dishId: 'd-1', name: 'Special Handi Chicken Biryani', category: 'Biryani', totalQuantity: 1420, totalRevenue: 454400, uniqueCustomers: 1180, growth: '+18.4%' },
  { dishId: 'd-2', name: 'Mughlai Butter Chicken Boneless', category: 'North Indian', totalQuantity: 1290, totalRevenue: 374100, uniqueCustomers: 1040, growth: '+12.6%' },
  { dishId: 'd-3', name: 'Dal Makhani Slow-Simmered', category: 'North Indian', totalQuantity: 980, totalRevenue: 215600, uniqueCustomers: 890, growth: '+9.2%' },
  { dishId: 'd-4', name: 'Artisan Burrata Truffle Pizza', category: 'Italian', totalQuantity: 740, totalRevenue: 369260, uniqueCustomers: 620, growth: '+24.1%' },
  { dishId: 'd-5', name: 'Garlic Butter Naan (Clay Oven)', category: 'Breads', totalQuantity: 2840, totalRevenue: 184600, uniqueCustomers: 1950, growth: '+15.8%' },
  { dishId: 'd-6', name: 'Kesar Pista Rasmalai Bowl', category: 'Desserts', totalQuantity: 890, totalRevenue: 115700, uniqueCustomers: 780, growth: '+7.5%' },
  { dishId: 'd-7', name: 'Double Truffle Smash Burger', category: 'Burgers', totalQuantity: 620, totalRevenue: 136400, uniqueCustomers: 510, growth: '+14.2%' },
];

export default function AnalyticsTopDishes() {
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'customers'>('revenue');

  const sortedDishes = [...SEED_TOP_DISHES].sort((a, b) => {
    if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
    if (sortBy === 'quantity') return b.totalQuantity - a.totalQuantity;
    return b.uniqueCustomers - a.uniqueCustomers;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', padding: '24px 32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Head>
        <title>Top Dishes Analytics | SpiceGarden Super Admin</title>
      </Head>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link href="/analytics" style={{ color: '#FF5A1F', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <ArrowLeft size={16} /> Back to Analytics Overview
            </Link>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={24} color="#FF5A1F" /> Best Selling Dishes &amp; Menu Matrix
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {(['revenue', 'quantity', 'customers'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortBy(s)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: sortBy === s ? '1.5px solid #FF5A1F' : '1px solid #334155',
                  background: sortBy === s ? 'rgba(255,90,31,0.15)' : '#1E293B',
                  color: sortBy === s ? '#FF5A1F' : '#94A3B8',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                Sort by {s}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', background: '#0F172A' }}>
                <th style={{ textAlign: 'left', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>Dish Name</th>
                <th style={{ textAlign: 'left', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>Category</th>
                <th style={{ textAlign: 'right', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>Qty Sold</th>
                <th style={{ textAlign: 'right', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>Gross Revenue</th>
                <th style={{ textAlign: 'right', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>Unique Diners</th>
                <th style={{ textAlign: 'right', padding: '14px 18px', color: '#94A3B8', fontWeight: 600 }}>MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {sortedDishes.map((dish, idx) => (
                <tr key={dish.dishId} style={{ borderBottom: '1px solid #334155', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px 18px', color: '#FF5A1F', fontWeight: 800 }}>#{idx + 1}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#FFF' }}>{dish.name}</td>
                  <td style={{ padding: '12px 18px', color: '#94A3B8' }}>{dish.category}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>{dish.totalQuantity.toLocaleString()}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', color: '#4ADE80', fontWeight: 800 }}>₹{dish.totalRevenue.toLocaleString()}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94A3B8' }}>{dish.uniqueCustomers.toLocaleString()}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', color: '#38BDF8', fontWeight: 700 }}>{dish.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
