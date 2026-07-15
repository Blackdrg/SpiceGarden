import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, LoadingState } from '@spicegarden/ui';
import styles from './gst-reports.module.css';

type GstReport = {
  period: { month: number; year: number };
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  totalInvoices: number;
  hsnWise: Array<{
    hsnCode: string;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    quantity: number;
  }>;
};

const GstReportsPage = () => {
  const [report, setReport] = useState<GstReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/business/gst/reports?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to fetch GST report:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const exportGSTR1 = useCallback(async () => {
    try {
      const res = await fetch(`/api/business/gst/export/gstr1?month=${month}&year=${year}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GSTR1_${year}_${month}.csv`;
        a.click();
      }
    } catch (err) {
      console.error('Failed to export GSTR1:', err);
    }
  }, [month, year]);

  if (loading) {
    return <div className={styles.loading}><LoadingState /></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>GST Reports</h1>
        <div className={styles.controls}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={styles.select} aria-label="Month">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={styles.select} aria-label="Year">
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
            ))}
          </select>
          <Button onClick={exportGSTR1} variant="secondary" size="sm">Export GSTR-1</Button>
        </div>
      </div>

      {report && (
        <>
          <div className={styles.summaryGrid}>
            <Card title="Taxable Value">
              <span className={styles.amount}>₹{report.totalTaxableValue.toFixed(2)}</span>
            </Card>
            <Card title="CGST">
              <span className={styles.amount}>₹{report.totalCGST.toFixed(2)}</span>
            </Card>
            <Card title="SGST">
              <span className={styles.amount}>₹{report.totalSGST.toFixed(2)}</span>
            </Card>
            <Card title="IGST">
              <span className={styles.amount}>₹{report.totalIGST.toFixed(2)}</span>
            </Card>
            <Card title="Total GST">
              <span className={styles.totalAmount}>₹{report.totalGST.toFixed(2)}</span>
            </Card>
            <Card title="Invoices">
              <span className={styles.amount}>{report.totalInvoices}</span>
            </Card>
          </div>

          <Card title="HSN/SAC Wise Summary" className={styles.hsnCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>HSN/SAC Code</th>
                  <th>Taxable Value</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>Total</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {report.hsnWise.map((row) => (
                  <tr key={row.hsnCode}>
                    <td>{row.hsnCode}</td>
                    <td>₹{row.taxableValue.toFixed(2)}</td>
                    <td>₹{row.cgst.toFixed(2)}</td>
                    <td>₹{row.sgst.toFixed(2)}</td>
                    <td>₹{row.igst.toFixed(2)}</td>
                    <td>₹{row.total.toFixed(2)}</td>
                    <td>{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

export default GstReportsPage;
