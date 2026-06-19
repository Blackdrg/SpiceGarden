param(
    [string]$BaseUrl = "http://localhost:3001"
)

Write-Host "=== SpiceGarden Auth Debug Script ===" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl" -ForegroundColor Gray

$ErrorActionPreference = "SilentlyContinue"

function Test-Endpoint {
    param($Name, $Method, $Url, $Body, $ExpectedStatus)
    try {
        $headers = @{ "Content-Type" = "application/json" }
        $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Body
        $status = 200
        Write-Host "[$Name] Status: 200 OK" -ForegroundColor Green
        Write-Host "  Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
        return $response
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $body = $_.Exception.Response.StatusDescription
        $color = if ($status -eq $ExpectedStatus) { "Green" } else { "Red" }
        Write-Host "[$Name] Status: $status (expected $ExpectedStatus)" -ForegroundColor $color
        Write-Host "  Body: $body" -ForegroundColor Gray
        return $null
    }
}

# 1. Health Check
Write-Host "`n--- Health Check ---" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
    Write-Host "Health: 200 OK" -ForegroundColor Green
} catch {
    Write-Host "Health: FAILED - Backend not running at $BaseUrl" -ForegroundColor Red
    Write-Host "Start backend with: cd apps/backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# 2. Register User 1
Write-Host "`n--- Register User 1 ---" -ForegroundColor Yellow
$user1Email = "debug-test-1@spicegarden.test"
$user1Password = "TestPass123!"
$user1 = Test-Endpoint -Name "Register 1" -Method POST -Url "$BaseUrl/auth/register" -Body (@{email=$user1Email; password=$user1Password; fullName="Debug Test 1"; phone="+15551230001"} | ConvertTo-Json) -ExpectedStatus 200
$token1 = if ($user1) { $user1.access_token } else { $null }

# 3. Register User 2 (different email)
Write-Host "`n--- Register User 2 ---" -ForegroundColor Yellow
$user2Email = "debug-test-2@spicegarden.test"
$user2Password = "TestPass456!"
$user2 = Test-Endpoint -Name "Register 2" -Method POST -Url "$BaseUrl/auth/register" -Body (@{email=$user2Email; password=$user2Password; fullName="Debug Test 2"; phone="+15551230002"} | ConvertTo-Json) -ExpectedStatus 200
$token2 = if ($user2) { $user2.access_token } else { $null }

# 4. Duplicate Email (should be 409)
Write-Host "`n--- Duplicate Email Test ---" -ForegroundColor Yellow
$dup = Test-Endpoint -Name "Duplicate Register" -Method POST -Url "$BaseUrl/auth/register" -Body (@{email=$user1Email; password="AnotherPass!"; fullName="Duplicate User"; phone="+15551230003"} | ConvertTo-Json) -ExpectedStatus 409

# 5. Login with correct credentials
Write-Host "`n--- Login Test ---" -ForegroundColor Yellow
$login = Test-Endpoint -Name "Login" -Method POST -Url "$BaseUrl/auth/login" -Body (@{email=$user1Email; password=$user1Password} | ConvertTo-Json) -ExpectedStatus 200
$loginToken = if ($login) { $login.access_token } else { $null }

# 6. Login with wrong password
Write-Host "`n--- Login Wrong Password ---" -ForegroundColor Yellow
$badLogin = Test-Endpoint -Name "Login Wrong Pass" -Method POST -Url "$BaseUrl/auth/login" -Body (@{email=$user1Email; password="WrongPass!"} | ConvertTo-Json) -ExpectedStatus 401

Write-Host "`n=== Auth Debug Complete ===" -ForegroundColor Cyan
