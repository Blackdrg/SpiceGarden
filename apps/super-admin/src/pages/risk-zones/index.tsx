import { useState, useEffect, useCallback } from 'react';
import { Card, Button, DESIGN_TOKENS } from '@spicegarden/ui';

interface RiskZone {
  id: string;
  name: string;
  description?: string;
  zoneType: 'radius' | 'polygon';
  riskScore: number;
  crimeCategory?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  reason?: string;
  createdAt: string;
}

function RiskZonesPage() {
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [stats, setStats] = useState({
    totalZones: 0,
    activeZones: 0,
    criticalZones: 0,
    events24h: 0,
  });

  const loadRiskZones = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSeverity !== 'all') params.set('severity', selectedSeverity);
      const response = await fetch('/api/risk-zones?' + params.toString());
      if (response.ok) {
        const data = await response.json();
        setZones(data);
      }
    } catch {
      // Use demo data for dashboard
      setZones(getDemoZones());
    }
  }, [selectedSeverity]);

  useEffect(() => {
    loadRiskZones();
    loadStats();
    const interval = setInterval(loadRiskZones, 30000);
    return () => clearInterval(interval);
  }, [selectedSeverity, loadRiskZones]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/risk-zones/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalZones: data.totalZones || 0,
          activeZones: data.activeZones || 0,
          criticalZones: data.criticalZones || 0,
          events24h: data.totalEvents24h || 0,
        });
      }
    } catch {
      setStats({ totalZones: 3, activeZones: 3, criticalZones: 1, events24h: 12 });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return DESIGN_TOKENS.colors.danger;
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      default: return DESIGN_TOKENS.colors.success;
    }
  };

  return (
    <div>
      <div className="headerRow">
        <div>
          <h2 className="pageTitle">Risk Zone Management</h2>
          <p className="pageSubtitle">Monitor and manage safety zones across delivery areas</p>
        </div>
        <Button onClick={() => {}} label="Add Risk Zone" variant="primary" />
      </div>

      <div className="kpiRow">
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{fontSize: 12, color: '#6B7280', marginBottom: 4}}>Total Zones</div>
          <div style={{fontSize: 24, fontWeight: 700, color: '#111827'}}>{stats.totalZones}</div>
          <div style={{fontSize: 12, color: '#6B7280'}}>registered</div>
        </div>
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{fontSize: 12, color: '#6B7280', marginBottom: 4}}>Active Zones</div>
          <div style={{fontSize: 24, fontWeight: 700, color: '#F59E0B'}}>{stats.activeZones}</div>
          <div style={{fontSize: 12, color: '#6B7280'}}>monitoring</div>
        </div>
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{fontSize: 12, color: '#6B7280', marginBottom: 4}}>Critical Zones</div>
          <div style={{fontSize: 24, fontWeight: 700, color: DESIGN_TOKENS.colors.danger}}>{stats.criticalZones}</div>
          <div style={{fontSize: 12, color: '#6B7280'}}>action needed</div>
        </div>
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{fontSize: 12, color: '#6B7280', marginBottom: 4}}>Events (24h)</div>
          <div style={{fontSize: 24, fontWeight: 700, color: '#EF4444'}}>{stats.events24h}</div>
          <div style={{fontSize: 12, color: '#6B7280'}}>incidents</div>
        </div>
      </div>

      <div className="filterRow">
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="filterSelect"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="tableContainer">
        <table className="table">
          <thead>
            <tr>
              <th>Zone Name</th>
              <th>Type</th>
              <th>Risk Score</th>
              <th>Severity</th>
              <th>Crime Category</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 && (
              <tr><td colSpan={8} className="emptyRow">No risk zones found</td></tr>
            )}
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{zone.name}</div>
                  {zone.reason && <div className="reasonText">{zone.reason.substring(0, 60)}...</div>}
                </td>
                <td><span className="severityBadge">{zone.zoneType}</span></td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: zone.riskScore >= 70 ? DESIGN_TOKENS.colors.danger :
                           zone.riskScore >= 40 ? '#F59E0B' : DESIGN_TOKENS.colors.success,
                  }}>
                    {zone.riskScore}/100
                  </span>
                </td>
                <td>
                  <span className="severityBadge" style={{ backgroundColor: getSeverityColor(zone.severity) + '20', color: getSeverityColor(zone.severity) }}>
                    {zone.severity.toUpperCase()}
                  </span>
                </td>
                <td>{zone.crimeCategory || '—'}</td>
                <td>
                  <span className={`statusBadge ${zone.isActive ? 'statusActive' : 'statusInactive'}`}>
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(zone.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button label={zone.isActive ? 'Deactivate' : 'Activate'} variant="secondary" size="sm" onClick={() => {}} />
                    <Button label="Edit" variant="secondary" size="sm" onClick={() => {}} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = `
  .headerRow { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .pageTitle { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
  .pageSubtitle { font-size: 13px; color: #6B7280; margin: 4px 0 0; }
  .kpiRow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .filterRow { display: flex; gap: 12px; margin-bottom: 16px; }
  .filterSelect { padding: 8px 12px; border: 1px solid ${DESIGN_TOKENS.colors.border}; border-radius: ${DESIGN_TOKENS.radius.md}; background: white; fontSize: 14px; }
  .tableContainer { background: white; borderRadius: ${DESIGN_TOKENS.radius.card}; border: 1px solid ${DESIGN_TOKENS.colors.border}; overflow: hidden; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { padding: 12px 16px; text-align: left; fontSize: 12px; fontWeight: 600; color: #6B7280; textTransform: uppercase; letterSpacing: 0.5px; background: #F9FAFB; borderBottom: 1px solid ${DESIGN_TOKENS.colors.border}; }
  .table td { padding: 12px 16px; fontSize: 14px; color: #374151; borderBottom: 1px solid #F3F4F6; }
  .table tr:hover { background: #F9FAFB; }
  .severityBadge { padding: 2px 8px; borderRadius: 4px; fontSize: 11px; fontWeight: 700; letterSpacing: 0.5px; }
  .statusBadge { padding: 2px 8px; borderRadius: 12px; fontSize: 11px; fontWeight: 600; }
  .statusActive { background: #ECFDF5; color: #059669; }
  .statusInactive { background: #F3F4F6; color: #6B7280; }
  .kpiCard { background: white; borderRadius: 8px; padding: 16px; border: 1px solid #E5E7EB; }
  .reasonText { fontSize: 12px; color: #9CA3AF; marginTop: 2px; }
  .emptyRow { textAlign: center; padding: 32px; color: #9CA3AF; }
`;

function getStyle(css: string) {
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('risk-zones-styles');
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = 'risk-zones-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }
}

const OriginalRiskZonesPage = () => {
  useEffect(() => { getStyle(styles); }, []);
  return <RiskZonesPage />;
};

function getDemoZones(): RiskZone[] {
  return [
    { id: '1', name: 'Demo Zone A', zoneType: 'radius', riskScore: 80, severity: 'high', isActive: true, createdAt: new Date().toISOString() },
    { id: '2', name: 'Demo Zone B', zoneType: 'polygon', riskScore: 40, severity: 'medium', isActive: true, createdAt: new Date().toISOString() },
  ];
}

export { OriginalRiskZonesPage as default };
