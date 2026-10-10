import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

export interface AlertPayload {
  id: string;
  severity: 'P1' | 'P2' | 'P3' | 'CRITICAL' | 'WARNING';
  summary: string;
  details: string;
  source: string;
  timestamp: string;
  metric?: string;
  threshold?: number;
  value?: number;
}

export class AlertChannelService {
  constructor(private readonly configService: ConfigService) {}

  formatPagerDuty(alert: AlertPayload) {
    const routingKey = this.configService?.get<string>('PAGERDUTY_ROUTING_KEY') || 'default-pd-key';
    return {
      routing_key: routingKey,
      event_action: 'trigger',
      dedup_key: `spicegarden-${alert.source}-${alert.id}`,
      payload: {
        summary: `[${alert.severity}] ${alert.summary}`,
        severity: alert.severity === 'P1' || alert.severity === 'CRITICAL' ? 'critical' : 'warning',
        source: alert.source,
        timestamp: alert.timestamp,
        custom_details: {
          details: alert.details,
          metric: alert.metric,
          threshold: alert.threshold,
          value: alert.value,
        },
      },
    };
  }

  formatSlack(alert: AlertPayload) {
    const color = alert.severity === 'P1' || alert.severity === 'CRITICAL' ? '#E01E5A' : '#ECB22E';
    return {
      text: `Alert: [${alert.severity}] ${alert.summary}`,
      attachments: [
        {
          color,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🚨 ${alert.severity}: ${alert.summary}`,
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Source:*\n${alert.source}` },
                { type: 'mrkdwn', text: `*Time:*\n${alert.timestamp}` },
                { type: 'mrkdwn', text: `*Metric:*\n${alert.metric || 'N/A'}` },
                { type: 'mrkdwn', text: `*Value/Threshold:*\n${alert.value ?? 'N/A'} / ${alert.threshold ?? 'N/A'}` },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Details:*\n${alert.details}`,
              },
            },
          ],
        },
      ],
    };
  }

  formatSMS(alert: AlertPayload, recipient: string) {
    const truncatedSummary = alert.summary.length > 80 ? `${alert.summary.substring(0, 77)}...` : alert.summary;
    return {
      to: recipient,
      body: `[SPICEGARDEN ALERT ${alert.severity}] ${truncatedSummary} | Source: ${alert.source} | Time: ${alert.timestamp}`,
    };
  }

  formatEmail(alert: AlertPayload, recipient: string) {
    const fromAddr = this.configService?.get<string>('ALERT_EMAIL_FROM') || 'alerts@spicegarden.internal';
    return {
      to: recipient,
      from: fromAddr,
      subject: `[${alert.severity}] SpiceGarden Alert: ${alert.summary}`,
      html: `
        <h2>SpiceGarden Operational Alert</h2>
        <p><strong>Severity:</strong> <span style="color:red">${alert.severity}</span></p>
        <p><strong>Source:</strong> ${alert.source}</p>
        <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
        <p><strong>Details:</strong> ${alert.details}</p>
        ${alert.metric ? `<p><strong>Metric:</strong> ${alert.metric} (Value: ${alert.value}, Threshold: ${alert.threshold})</p>` : ''}
      `,
    };
  }
}

describe('Alert Channels Integration Test Suite', () => {
  let service: AlertChannelService;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'PAGERDUTY_ROUTING_KEY') return 'pd-live-key-123';
        if (key === 'ALERT_EMAIL_FROM') return 'ops@spicegarden.app';
        return null;
      }),
    };

    service = new AlertChannelService(mockConfigService);
  });

  const sampleAlert: AlertPayload = {
    id: 'alt-8891',
    severity: 'P1',
    summary: 'High PostgreSQL Connection Saturation Detected',
    details: 'Active connections exceeded 95% threshold for >2 minutes.',
    source: 'rds-aurora-primary',
    timestamp: '2026-10-03T15:30:00Z',
    metric: 'pg_stat_activity_connections',
    threshold: 95,
    value: 98,
  };

  it('should format PagerDuty incident payload with critical severity and routing key', () => {
    const pd = service.formatPagerDuty(sampleAlert);
    expect(pd.routing_key).toBe('pd-live-key-123');
    expect(pd.event_action).toBe('trigger');
    expect(pd.dedup_key).toBe('spicegarden-rds-aurora-primary-alt-8891');
    expect(pd.payload.severity).toBe('critical');
    expect(pd.payload.summary).toContain('[P1]');
    expect(pd.payload.custom_details.metric).toBe('pg_stat_activity_connections');
  });

  it('should format Slack message with structured interactive blocks and red severity color', () => {
    const slack = service.formatSlack(sampleAlert);
    expect(slack.attachments[0].color).toBe('#E01E5A');
    expect(slack.attachments[0].blocks[0].text.text).toContain('🚨 P1');
    expect(slack.attachments[0].blocks[1].fields[0].text).toContain('rds-aurora-primary');
  });

  it('should format concise SMS alert with character boundary guarantee', () => {
    const sms = service.formatSMS(sampleAlert, '+1234567890');
    expect(sms.to).toBe('+1234567890');
    expect(sms.body).toContain('[SPICEGARDEN ALERT P1]');
    expect(sms.body.length).toBeLessThan(160);
  });

  it('should format HTML email alert with full diagnostic context', () => {
    const email = service.formatEmail(sampleAlert, 'oncall@spicegarden.app');
    expect(email.from).toBe('ops@spicegarden.app');
    expect(email.to).toBe('oncall@spicegarden.app');
    expect(email.subject).toContain('[P1]');
    expect(email.subject).toContain('High PostgreSQL Connection Saturation Detected');
    expect(email.html).toContain('Active connections exceeded 95% threshold for >2 minutes.');
    expect(email.html).toContain('pg_stat_activity_connections');
  });
});
