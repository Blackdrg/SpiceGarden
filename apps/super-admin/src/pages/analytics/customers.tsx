import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, UserMinus, Repeat, Award } from 'lucide-react';

interface RepeatCustomer {
  userId: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  favoriteDish: string;
  lastOrder: string;
}

const TOP_REPEAT_CUSTOMERS: RepeatCustomer[] = [
  { userId: 'USR-9021', name: 'Arjun Mehta', phone: '+91 98765 43210', orderCount: 28, totalSpent: 18450, favoriteDish: 'Handi Chicken Biryani', lastOrder: 'Today, 1:45 PM' },
  { userId: 'USR-8412', name: 'Simran Kaur', phone: '+91 98123 90812', orderCount: 22, totalSpent: 14200, favoriteDish: 'Butter Chicken & Naan', lastOrder: 'Yesterday, 8:15 PM' },
  { userId: 'USR-7890', name: 'Rohan Sharma', phone: '+91 97890 12345', orderCount: 19, totalSpent: 11900, favoriteDish: 'Burrata Truffle Pizza', lastOrder: 'Oct 06, 2026' },
  { userId: 'USR-6541', name: 'Pooja Verma', phone: '+91 98345 67890', orderCount: 16, totalSpent: 9800, favoriteDish: 'Dal Makhani & Kulcha', lastOrder: 'Oct 04, 2026' },
  { userId: 'USR-5129', name: 'Vikram Grover', phone: '+91 99012 34567', orderCount: 14, totalSpent: 8750, favoriteDish: 'Smash Burger & Fries', lastOrder: 'Sep 29, 2026' },
];

export default function AnalyticsCustomers() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', padding: '24px 32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Head>
        <title>Customer Cohort Analytics | SpiceGarden Super Admin</title>
      </Head>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/analytics" style={{ color: '#FF5A1F', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <ArrowLeft size={16} /> Back to Analytics Overview
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={24} color="#FF5A1F" /> Customer Cohorts &amp; Retention Analytics
        </h1>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>TOTAL REGISTERED DINERS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFF' }}>12,840</div>
            <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>+14.2% new this month</div>
          </div>

          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>MONTHLY ACTIVE DINERS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#38BDF8' }}>8,920</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>69.4% engagement rate</div>
          </div>

          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>REPEAT ORDER RATE</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#4ADE80' }}>64.8%</div>
            <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>Avg 3.4 orders / month</div>
          </div>

          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>CHURN RATE (30D)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FB923C' }}>5.2%</div>
            <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>-1.8% vs last month</div>
          </div>
        </div>

        {/* Top VIP Diners Table */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={18} color="#FF5A1F" /> Top Loyalty &amp; High-Frequency Diners
            </h3>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Lifetime Value Leaderboard</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', background: '#0F172A' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>Diner Name</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>Contact</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>Orders Placed</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>Total Spent</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>Favorite Meal</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {TOP_REPEAT_CUSTOMERS.map((c) => (
                <tr key={c.userId} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#FFF' }}>{c.name}</td>
                  <td style={{ padding: '12px 18px', color: '#94A3B8', fontSize: 13 }}>{c.phone}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'center', fontWeight: 800, color: '#38BDF8' }}>{c.orderCount}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', color: '#4ADE80', fontWeight: 800 }}>₹{c.totalSpent.toLocaleString()}</td>
                  <td style={{ padding: '12px 18px', color: '#CBD5E1', fontSize: 13 }}>{c.favoriteDish}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', color: '#94A3B8', fontSize: 12 }}>{c.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
