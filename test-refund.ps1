Add-Type -AssemblyName System.Net.Http
$tests = @(
    @{method='PATCH'; url='http://localhost:3001/refunds/abc/approve'; body='{"approverId":"1","notes":"test"}'},
    @{method='PATCH'; url='http://localhost:3001/refunds/abc/reject'; body='{"approverId":"1","reason":"test"}'}
)
$client = New-Object System.Net.Http.HttpClient
$client.Timeout = New-Object TimeSpan(0,0,0,10)
foreach ($test in $tests) {
    try {
        $content = New-Object System.Net.Http.StringContent($test.body, [System.Text.Encoding]::UTF8, 'application/json')
        $r = $client.PatchAsync($test.url, $content).Result
        Write-Host "$($test.method) $($test.url) -> $($r.StatusCode.value__)"
    } catch {
        $sc = 0
        if ($_.Exception.InnerException -and $_.Exception.InnerException.Response) {
            $sc = [int]$_.Exception.InnerException.Response.StatusCode
        } elseif ($_.Exception.Response) {
            $sc = [int]$_.Exception.Response.StatusCode
        }
        $msg = $_.Exception.Message
        if ($msg.Length -gt 100) { $msg = $msg.Substring(0, 100) }
        Write-Host "$($test.method) $($test.url) -> ERR $sc $msg"
    }
}
