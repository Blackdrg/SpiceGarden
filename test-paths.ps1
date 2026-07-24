$paths = @(
    'http://localhost:3001/admin/tenants/slug/abc',
    'http://localhost:3001/admin/tenants/slug/:slug',
    'http://localhost:3001/legal/documents/terms',
    'http://localhost:3001/legal/documents/:type',
    'http://localhost:3001/finance/bank-accounts/123'
)
foreach ($path in $paths) {
    try {
        $r = Invoke-WebRequest -Uri $path -TimeoutSec 5 -UseBasicParsing
        Write-Host "$path -> $($r.StatusCode.value__)"
    } catch {
        $sc = 0
        if ($_.Exception.Response) { $sc = $_.Exception.Response.StatusCode.value__ }
        Write-Host "$path -> ERR $sc"
    }
}
