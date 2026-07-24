$tests = @(
    @{url='http://localhost:3001/refunds/abc/approve'; method='PATCH'; body='{"approverId":"1","notes":"test"}'},
    @{url='http://localhost:3001/refunds/:approvalId/approve'; method='PATCH'; body='{"approverId":"1","notes":"test"}'},
    @{url='http://localhost:3001/refunds/xyz/reject'; method='PATCH'; body='{"approverId":"1","reason":"test"}'},
    @{url='http://localhost:3001/refunds/:approvalId/reject'; method='PATCH'; body='{"approverId":"1","reason":"test"}'}
)
foreach ($test in $tests) {
    try {
        $r = Invoke-WebRequest -Uri $test.url -Method $test.method -Body $test.body -ContentType 'application/json' -TimeoutSec 10 -UseBasicParsing
        Write-Host "$($test.method) $($test.url) -> $($r.StatusCode.value__)"
    } catch {
        $sc = 0
        if ($_.Exception.Response) { $sc = [int]$_.Exception.Response.StatusCode.value__ }
        $msg = $_.Exception.Message
        if ($msg.Length -gt 100) { $msg = $msg.Substring(0, 100) }
        Write-Host "$($test.method) $($test.url) -> ERR $sc $msg"
    }
}
