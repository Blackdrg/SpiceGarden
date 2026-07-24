try {
    $body = '{"origin":{"lat":40.7128,"lng":-74.006},"destination":{"lat":40.7589,"lng":-73.9851}}'
    $r = Invoke-WebRequest -Uri 'http://localhost:3001/maps/reroute' -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 10 -UseBasicParsing
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
