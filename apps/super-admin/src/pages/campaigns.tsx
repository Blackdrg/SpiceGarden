import React, { useEffect, useState } from 'react';
import { Card, Button, LoadingState, EmptyState } from '@spicegarden/ui';
import styles from './campaigns.module.css';

type Campaign = {
  id: string;
  name: string;
  campaignType: string;
  status: string;
  budget: number;
  spentBudget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string;
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const [campaignsRes, statsRes] = await Promise.all([
        fetch('/api/admin/marketing/campaigns'),
        fetch('/api/admin/marketing/campaigns/platform/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          }),
        }),
      ]);

      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const activateCampaign = async (id: string) => {
    await fetch(`/api/admin/marketing/campaigns/${id}/activate`, { method: 'POST' });
    fetchCampaigns();
  };

  const pauseCampaign = async (id: string) => {
    await fetch(`/api/admin/marketing/campaigns/${id}/pause`, { method: 'POST' });
    fetchCampaigns();
  };

  if (loading) {
    return <div className={styles.loading}><LoadingState /></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Campaign Management</h1>

      {stats && (
        <div className={styles.statsGrid}>
          <Card title="Total Campaigns">
            <span className={styles.statValue}>{stats.totalCampaigns}</span>
          </Card>
          <Card title="Active Campaigns">
            <span className={styles.statValue}>{stats.activeCampaigns}</span>
          </Card>
          <Card title="Total Impressions">
            <span className={styles.statValue}>{stats.totalImpressions.toLocaleString()}</span>
          </Card>
          <Card title="Total Clicks">
            <span className={styles.statValue}>{stats.totalClicks.toLocaleString()}</span>
          </Card>
          <Card title="Total Spent">
            <span className={styles.statValue}>₹{stats.totalSpent.toFixed(2)}</span>
          </Card>
          <Card title="Avg CTR">
            <span className={styles.statValue}>{stats.avgCtr.toFixed(2)}%</span>
          </Card>
        </div>
      )}

      <div className={styles.campaignList}>
        {campaigns.map((campaign) => (
          <Card key={campaign.id} title={campaign.name}>
            <div className={styles.campaignHeader}>
              <span className={`${styles.status} ${styles[campaign.status]}`}>{campaign.status}</span>
              <span className={styles.type}>{campaign.campaignType}</span>
            </div>
            <div className={styles.campaignStats}>
              <div>
                <span className={styles.label}>Budget</span>
                <span className={styles.value}>₹{campaign.budget.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.label}>Spent</span>
                <span className={styles.value}>₹{campaign.spentBudget.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.label}>Impressions</span>
                <span className={styles.value}>{campaign.impressions.toLocaleString()}</span>
              </div>
              <div>
                <span className={styles.label}>Clicks</span>
                <span className={styles.value}>{campaign.clicks.toLocaleString()}</span>
              </div>
              <div>
                <span className={styles.label}>Conversions</span>
                <span className={styles.value}>{campaign.conversions.toLocaleString()}</span>
              </div>
              <div>
                <span className={styles.label}>CTR</span>
                <span className={styles.value}>{campaign.ctr?.toFixed(2) || 0}%</span>
              </div>
            </div>
            <div className={styles.actions}>
              {campaign.status === 'active' ? (
                <Button onClick={() => pauseCampaign(campaign.id)} variant="secondary" size="sm">Pause</Button>
              ) : (
                <Button onClick={() => activateCampaign(campaign.id)} variant="primary" size="sm">Activate</Button>
              )}
            </div>
          </Card>
        ))}
        {campaigns.length === 0 && (
          <EmptyState title="No campaigns" description="Create a campaign to get started" />
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
