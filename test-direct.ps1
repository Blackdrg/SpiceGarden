$tests = @(
    @{url='http://localhost:3001/legal/center'; method='GET'},
    @{url='http://localhost:3001/legal/consent/active'; method='GET'},
    @{url='http://localhost:3001/legal/cookie-registry'; method='GET'},
    @{url='http://localhost:3001/privacy/dpdp/officer'; method='GET'},
    @{url='http://localhost:3001/security-center/contact'; method='GET'},
    @{url='http://localhost:3001/apis/123'; method='GET'},
    @{url='http://localhost:3001/ai/chatbot'; method='POST'; body='{"message":"test"}'; contentType='application/json'},
    @{url='http://localhost:3001/auth/logout'; method='POST'}
)

foreach ($test in $tests) {
    try {
        if ($test.body) {
            $r = Invoke-WebRequest -Uri $test.url -Method $test.method -Body $test.body -ContentType $test.contentType -TimeoutSec 10 -UseBasicParsing
        } else {
            $r = Invoke-WebRequest -Uri $test.url -Method $test.method -TimeoutSec 10 -UseBasicParsing
        }
        Write-Host "$($test.method) $($test.url) -> $($r.StatusCode.value__) $($r.Content.Substring(0, [Math]::Min(80, $r.Content.Length)))"
    } catch {
        $sc = 0
        $msg = ""
        if ($_.Exception.Response) {
            $sc = $_.Exception.Response.StatusCode.value__
            $msg = $_.Exception.Message
        } else {
            $msg = "NO_RESPONSE: " + $_.Exception.Message
        }
        if ($msg.Length -gt 80) { $msg = $msg.Substring(0, 80) }
        Write-Host "$($test.method) $($test.url) -> ERR $sc $msg"
    }
}
