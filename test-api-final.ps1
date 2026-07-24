Add-Type -AssemblyName System.Net.Http

$backendUrl = "http://localhost:3001"
$results = @()
$totalTested = 0
$passCount = 0
$failCount = 0
$http500Count = 0
$criticalFailures = @()
$timeoutFailures = @()
$notFoundEndpoints = @()

$endpoints = Get-Content "D:\SpiceGarden\api-verification-full.json" | ConvertFrom-Json | Select-Object -ExpandProperty results

$client = New-Object System.Net.Http.HttpClient
$client.Timeout = New-Object TimeSpan(0,0,0,15)

Write-Host "Starting comprehensive API verification with $($endpoints.Count) endpoints..."
Write-Host "Backend URL: $backendUrl"
Write-Host ""

$progress = 0
foreach ($endpoint in $endpoints) {
    $progress++
    if ($progress % 50 -eq 0) {
        Write-Host "Progress: $progress / $($endpoints.Count) tested..."
    }
    $totalTested++
    $path = $endpoint.path
    $method = $endpoint.method
    
    $requestUrl = "$backendUrl$path"
    $bodyContent = $null
    $contentType = "application/json"
    
    # Special handling for fixed endpoints
    if ($path -eq "/ai/chatbot" -and $method -eq "POST") {
        $bodyContent = '{"message":"test"}'
    }
    elseif ($path -eq "/maps/reroute" -and $method -eq "POST") {
        $bodyContent = '{"origin":{"lat":40.7128,"lng":-74.006},"destination":{"lat":40.7589,"lng":-73.9851}}'
    }
    
    $statusCode = 0
    $responseBody = ""
    
    try {
        if ($method -eq "GET") {
            $response = $client.GetAsync($requestUrl).Result
        } elseif ($method -eq "POST") {
            $content = New-Object System.Net.Http.StringContent($bodyContent, [System.Text.Encoding]::UTF8, $contentType)
            $response = $client.PostAsync($requestUrl, $content).Result
        } elseif ($method -eq "PUT") {
            $content = New-Object System.Net.Http.StringContent($bodyContent, [System.Text.Encoding]::UTF8, $contentType)
            $response = $client.PutAsync($requestUrl, $content).Result
        } elseif ($method -eq "PATCH") {
            $request = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Patch, $requestUrl)
            if ($bodyContent) {
                $request.Content = New-Object System.Net.Http.StringContent($bodyContent, [System.Text.Encoding]::UTF8, $contentType)
            }
            $response = $client.SendAsync($request).Result
        } elseif ($method -eq "DELETE") {
            $response = $client.DeleteAsync($requestUrl).Result
        } else {
            $response = $client.GetAsync($requestUrl).Result
        }
        
        $statusCode = [int]$response.StatusCode
        $responseBody = $response.Content.ReadAsStringAsync().Result
    }
    catch {
        try {
            $ex = $_.Exception
            if ($ex.InnerException -and $ex.InnerException.Response) {
                $statusCode = [int]$ex.InnerException.Response.StatusCode
            } elseif ($ex.Response) {
                $statusCode = [int]$ex.Response.StatusCode
            } else {
                $statusCode = 0
            }
            $responseBody = $ex.Message
        } catch {
            $statusCode = 0
            $responseBody = $_.Exception.Message
        }
    }
    
    $status = ""
    $requiresAuth = $false
    
    if ($statusCode -in @(200, 201, 202, 204)) {
        $status = "PASS"
        $passCount++
    }
    elseif ($statusCode -in @(400, 401, 403, 429)) {
        $status = "PASS (endpoint reachable)"
        $passCount++
        $requiresAuth = $true
    }
    elseif ($statusCode -eq 404) {
        $status = "FAIL (not found)"
        $failCount++
        $requiresAuth = $false
        $criticalFailures += "$method $path (status: $statusCode)"
        $notFoundEndpoints += "$method $path"
    }
    elseif ($statusCode -eq 500) {
        $status = "FAIL (500 error)"
        $failCount++
        $http500Count++
        $requiresAuth = $false
        $criticalFailures += "$method $path (status: $statusCode)"
    }
    elseif ($statusCode -eq 0) {
        $status = "FAIL (timeout/network error)"
        $failCount++
        $requiresAuth = $false
        $criticalFailures += "$method $path (timeout)"
        $timeoutFailures += "$method $path"
    }
    else {
        $status = "FAIL (status $statusCode)"
        $failCount++
        $requiresAuth = $false
        if ($statusCode -ge 500) {
            $http500Count++
        }
        $criticalFailures += "$method $path (status: $statusCode)"
    }
    
    $result = @{
        method = $method
        path = $path
        controller = $endpoint.controller
        statusCode = $statusCode
        responseBody = $responseBody
        status = $status
        requiresAuth = $requiresAuth
    }
    $results += $result
    
    Start-Sleep -Milliseconds 10
}

# Summary
Write-Host ""
Write-Host "=== VERIFICATION COMPLETE ==="
Write-Host "Total Tested: $totalTested"
Write-Host "PASS: $passCount"
Write-Host "FAIL: $failCount"
Write-Host "500 Errors: $http500Count"
if ($timeoutFailures.Count -gt 0) {
    Write-Host "Timeouts: $($timeoutFailures.Count)"
    $timeoutFailures | ForEach-Object { Write-Host "  - $_" }
}
Write-Host ""
if ($criticalFailures.Count -gt 0) {
    Write-Host "Critical Failures ($($criticalFailures.Count)):"
    $criticalFailures | ForEach-Object { Write-Host "  - $_" }
}

Write-Host ""
Write-Host "=== NOT FOUND ENDPOINTS ==="
if ($notFoundEndpoints.Count -gt 0) {
    $notFoundEndpoints | ForEach-Object { Write-Host "  - $_" }
}

# Check specifically the fixed endpoints
Write-Host ""
Write-Host "=== FIXED ENDPOINT CHECK ==="
$fixedEndpointChecks = @(
    "POST /ai/chatbot",
    "POST /maps/reroute",
    "GET /marketing/campaigns/platform/stats"
)
foreach ($check in $fixedEndpointChecks) {
    $parts = $check.Split(" ")
    $m = $parts[0]
    $p = $parts[1]
    $result = $results | Where-Object { $_.method -eq $m -and $_.path -eq $p }
    if ($result) {
        Write-Host "$check -> Status: $($result.statusCode) | $($result.status)"
    } else {
        Write-Host "$check -> NOT FOUND in results"
    }
}

# Build final report
$finalReport = @{
    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    backendUrl = $backendUrl
    statistics = @{
        totalEndpoints = $endpoints.Count
        totalTested = $totalTested
        pass = $passCount
        fail = $failCount
        notVerified = 0
        http500 = $http500Count
        timeoutFailures = $timeoutFailures.Count
        criticalFailures = if ($criticalFailures.Count -gt 0) { $criticalFailures -join "; " } else { "" }
    }
    results = $results
}

$jsonContent = $finalReport | ConvertTo-Json -Depth 10
$jsonContent | Out-File -FilePath "D:\SpiceGarden\api-verification-final.json" -Encoding utf8

Write-Host ""
Write-Host "Report saved to D:\SpiceGarden\api-verification-final.json"
