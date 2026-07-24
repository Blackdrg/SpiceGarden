try {
    $body = '{"message":"test"}'
    $r = Invoke-WebRequest -Uri 'http://localhost:3001/ai/chatbot' -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 10 -UseBasicParsing
    Write-Host "OK: $($r.StatusCode.value__) $($r.Content)"
} catch {
    $sc = 0
    if ($_.Exception.Response) {
        $sc = $_.Exception.Response.StatusCode.value__
    }
    $msg = $_.Exception.Message
    if ($msg.Length -gt 100) { $msg = $msg.Substring(0, 100) }
    Write-Host "ERR: $sc $msg"
}
