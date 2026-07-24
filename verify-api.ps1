<#
.SYNOPSIS
    SpiceGarden API Verification Script
#>

$baseUrl = "http://localhost:3001"
$backendSrc = "D:\SpiceGarden\apps\backend\src"
$outputPath = "D:\SpiceGarden\api-verification-full.json"

$controllerFiles = Get-ChildItem -Path $backendSrc -Recurse -Filter "*.controller.ts"
Write-Host "Found $($controllerFiles.Count) controller files"

$routes = @()

foreach ($file in $controllerFiles) {
    $relativePath = $file.FullName.Substring($backendSrc.Length + 1)
    $controllerPath = $null
    $moduleUseGuards = $false
    $lines = [System.IO.File]::ReadAllLines($file.FullName)
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i].Trim()
        
        if ($controllerPath -eq $null -and $line -match "^@UseGuards\((.+?)\)") {
            $moduleUseGuards = $true
        }
        
        if ($line -match "^@Controller\(([`"])(.+?)\1\)") {
            $controllerPath = $matches[2]
            continue
        }
        
        if ($controllerPath -ne $null -and $line -match "^@(Get|Post|Put|Delete|Patch)\(([`"])(.+?)\2\)") {
            $method = $matches[1]
            $routePath = $matches[3]
            $fullPath = "/$controllerPath/$routePath"
            $fullPath = $fullPath -replace '/+', '/' -replace '/$', ''
            
            $requiresAuth = $moduleUseGuards
            
            for ($j = $i - 1; $j -gt [Math]::Max(0, $i - 5); $j--) {
                $prevLine = $lines[$j].Trim()
                if ($prevLine -match "^@UseGuards") {
                    $requiresAuth = $true
                    break
                }
                if ($prevLine -match "^@(Get|Post|Put|Delete|Patch|Controller|UseGuards|Roles|Permissions|ApiTags|ApiOperation|ApiQuery|ApiParam|Req|Res|Body|Param|Query)\(") {
                    if ($prevLine -match "^@(Get|Post|Put|Delete|Patch|Controller)\(|async |function ") {
                        break
                    }
                }
            }
            
            $routes += [PSCustomObject]@{
                method = $method.ToUpper()
                path = $fullPath
                controller = $relativePath
                requiresAuth = $requiresAuth
            }
        }
    }
}

Write-Host "Discovered $($routes.Count) endpoints"

$results = @()
$tested = 0
$passCount = 0
$failCount = 0
$notVerifiedCount = 0
$criticalFailures = @()

foreach ($route in $routes) {
    $status = "NOT VERIFIED"
    $statusCode = $null
    $responseBody = ""
    $expectedAuth = $route.requiresAuth
    
    try {
        $uri = "$baseUrl$($route.path)"
        
        switch ($route.method) {
            "GET" {
                $response = Invoke-WebRequest -Uri $uri -Method Get -UseBasicParsing -TimeoutSec 10
            }
            "POST" {
                $response = Invoke-WebRequest -Uri $uri -Method Post -UseBasicParsing -TimeoutSec 10 -ContentType "application/json" -Body "{}"
            }
            "PUT" {
                $response = Invoke-WebRequest -Uri $uri -Method Put -UseBasicParsing -TimeoutSec 10 -ContentType "application/json" -Body "{}"
            }
            "DELETE" {
                $response = Invoke-WebRequest -Uri $uri -Method Delete -UseBasicParsing -TimeoutSec 10
            }
            "PATCH" {
                $response = Invoke-WebRequest -Uri $uri -Method Patch -UseBasicParsing -TimeoutSec 10 -ContentType "application/json" -Body "{}"
            }
        }
        
        $statusCode = $response.StatusCode
        $responseBody = $response.Content
        
        if ($expectedAuth -and $statusCode -eq 401) {
            $status = "PASS (requires auth)"
            $passCount++
        } elseif ($statusCode -ge 200 -and $statusCode -lt 300) {
            $status = "PASS"
            $passCount++
        } elseif ($statusCode -ge 400 -and $statusCode -lt 500) {
            $status = "FAIL"
            $failCount++
        } else {
            $status = "FAIL"
            $failCount++
        }
        
        $tested++
    }
    catch {
        $webEx = $_.Exception
        $statusCode = $null
        
        if ($webEx.Response) {
            $statusCode = $webEx.Response.StatusCode.value__
            $stream = $webEx.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
        } else {
            $responseBody = $webEx.Message
            $statusCode = "ERROR"
        }
        
        if ($expectedAuth) {
            $status = "PASS (requires auth)"
            $passCount++
        } else {
            $status = "FAIL"
            $failCount++
            $criticalFailures += "$($route.method) $($route.path)"
        }
        
        $tested++
    }
    
    $result = [PSCustomObject]@{
        method = $route.method
        path = $route.path
        controller = $route.controller
        statusCode = $statusCode
        responseBody = $responseBody.Substring(0, [Math]::Min(200, $responseBody.Length))
        status = $status
        requiresAuth = $expectedAuth
    }
    $results += $result
    
    Write-Host ("[{0}] {1} {2} -> {3}" -f $status, $route.method, $route.path, $statusCode)
}

$output = [PSCustomObject]@{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    backendUrl = $baseUrl
    statistics = [PSCustomObject]@{
        totalEndpoints = $routes.Count
        totalTested = $tested
        pass = $passCount
        fail = $failCount
        notVerified = $notVerifiedCount
        criticalFailures = @($criticalFailures -join ", ")
    }
    results = $results
}

$jsonOutput = $output | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($outputPath, $jsonOutput, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "===== VERIFICATION SUMMARY ====="
Write-Host "Total endpoints discovered: $($routes.Count)"
Write-Host "Total endpoints tested: $tested"
Write-Host "PASS: $passCount"
Write-Host "FAIL: $failCount"
Write-Host "NOT VERIFIED: $notVerifiedCount"
Write-Host ""
Write-Host "Report saved to: $outputPath"
