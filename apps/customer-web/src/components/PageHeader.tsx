import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, actionLabel, onAction }) => {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>{title}</h1>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{ background: '#ff5a1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 6px rgba(255,90,31,0.3)' }}
        >
          <Plus size={16} /> {actionLabel}
        </button>
      )}
    </div>
  );
};
