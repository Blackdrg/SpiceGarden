#!/bin/sh
set -e

CFG=/etc/alertmanager/alertmanager.yml

{
  echo 'route:'
  echo "  group_by: ['alertname', 'job']"
  echo '  group_wait: 30s'
  echo '  group_interval: 5m'
  echo '  repeat_interval: 3h'

  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    RCV=slack-notifications
  else
    RCV=null-receiver
  fi
  echo "  receiver: '$RCV'"

  echo 'receivers:'
  echo "  - name: 'null-receiver'"
  echo '    webhook_configs:'
  echo '      - url: http://127.0.0.1:9093/-/ready'
  echo '        send_resolved: true'

  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "  - name: 'slack-notifications'"
    echo '    slack_configs:'
    echo "      - api_url: '$SLACK_WEBHOOK_URL'"
    echo "        channel: '#alerts'"
    echo '        send_resolved: true'
    echo "        title: '[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'"
    echo '        text: |'
    echo '          {{ range .Alerts -}}'
    echo '          *Alert:* {{ .Annotations.summary }}'
    echo '          *Description:* {{ .Annotations.description }}'
    echo '          *Severity:* {{ .Labels.severity }}'
    echo '          *Instance:* {{ .Labels.instance }}'
    echo '          {{ end -}}'
  fi

  if [ -n "$PAGERDUTY_ROUTING_KEY" ]; then
    echo "  - name: 'pagerduty-notifications'"
    echo '    pagerduty_configs:'
    echo "      - routing_key: '$PAGERDUTY_ROUTING_KEY'"
    echo "        severity: '{{ .GroupLabels.severity }}'"
  fi

  echo 'inhibit_rules:'
  echo '  - source_match:'
  echo "      severity: 'critical'"
  echo '    target_match:'
  echo "      severity: 'warning'"
  echo "    equal: ['alertname']"
} > "$CFG"

echo '--- generated alertmanager config ---'
cat "$CFG"
echo '--- end ---'

exec alertmanager --config.file="$CFG"
