import React, { useEffect, useState } from 'react';
import { Card, Button, LoadingState, EmptyState } from '@spicegarden/ui';
import styles from './tenants.module.css';

type Tenant = {
  id: string;
  slug: string;
  name: string;
  displayName?: string;
  status: string;
  customDomain?: string;
  maxUsers: number;
  maxRestaurants: number;
  createdAt: string;
};

const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTenants();
  }, [filter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/admin/tenants' : `/api/admin/tenants?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        setTenants(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const suspendTenant = async (id: string) => {
    await fetch(`/api/admin/tenants/${id}/suspend`, { method: 'POST' });
    fetchTenants();
  };

  const activateTenant = async (id: string) => {
    await fetch(`/api/admin/tenants/${id}/activate`, { method: 'POST' });
    fetchTenants();
  };

  if (loading) {
    return <div className={styles.loading}><LoadingState /></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tenant Management</h1>

      <div className={styles.filters}>
        {['all', 'active', 'suspended', 'trial'].map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className={styles.tenantList}>
        {tenants.map((tenant) => (
          <Card key={tenant.id} title={tenant.displayName || tenant.name}>
            <div className={styles.tenantHeader}>
              <span className={styles.slug}>@{tenant.slug}</span>
              <span className={`${styles.status} ${styles[tenant.status]}`}>{tenant.status}</span>
            </div>
            {tenant.customDomain && (
              <p className={styles.domain}>Domain: {tenant.customDomain}</p>
            )}
            <div className={styles.tenantStats}>
              <div>
                <span className={styles.label}>Users</span>
                <span className={styles.value}>{tenant.maxUsers}</span>
              </div>
              <div>
                <span className={styles.label}>Restaurants</span>
                <span className={styles.value}>{tenant.maxRestaurants}</span>
              </div>
              <div>
                <span className={styles.label}>Created</span>
                <span className={styles.value}>{new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={styles.actions}>
              {tenant.status === 'active' || tenant.status === 'trial' ? (
                <Button onClick={() => suspendTenant(tenant.id)} variant="secondary" size="sm">Suspend</Button>
              ) : (
                <Button onClick={() => activateTenant(tenant.id)} variant="primary" size="sm">Activate</Button>
              )}
            </div>
          </Card>
        ))}
        {tenants.length === 0 && (
          <EmptyState title="No tenants" description="No tenants match the current filter" />
        )}
      </div>
    </div>
  );
};

export default TenantsPage;
