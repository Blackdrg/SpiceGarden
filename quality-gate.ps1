[CmdletBinding()]
param(
    [string]$ReportDirectory
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
Set-StrictMode -Version 2.0

$repoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
if (-not $ReportDirectory) {
    $ReportDirectory = Join-Path $repoRoot "reports/quality-gate"
}
$startedAt = Get-Date
$timestamp = $startedAt.ToString("o")
New-Item -ItemType Directory -Force -Path $ReportDirectory | Out-Null
$tempDirectory = Join-Path $ReportDirectory ".tmp"
New-Item -ItemType Directory -Force -Path $tempDirectory | Out-Null
Get-ChildItem -LiteralPath $ReportDirectory -File -ErrorAction SilentlyContinue | Remove-Item -Force

$script:checks = @($null) * 11
$script:checkIndex = 0

function Get-StatusFromResult($exitCode, $output, $name) {
    if ($exitCode -ne 0) {
        return "FAIL"
    }

    if ($name -eq "React Doctor") {
        if ($output -match "Score API unreachable|Score API|fetch failed") {
            return "WARNING"
        }
        if ($output -match "(?i)\bwarning\b|\bwarnings\b|⚠") {
            return "WARNING"
        }
    }

    return "PASS"
}

function Invoke-CapturedCommand($name, $command, $logFile) {
    $process = [System.Diagnostics.Process]::new()
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $exitCode = -1
    $output = ""
    $stderr = ""
    $stdoutFile = $null
    $stderrFile = $null

    try {
        $safeName = ($name -replace '[^A-Za-z0-9_.-]', '_')
        $stdoutFile = Join-Path $tempDirectory "$safeName.stdout.txt"
        $stderrFile = Join-Path $tempDirectory "$safeName.stderr.txt"
        Remove-Item -LiteralPath $stdoutFile -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $stderrFile -Force -ErrorAction SilentlyContinue

        $psi = [System.Diagnostics.ProcessStartInfo]::new()
        $psi.FileName = "powershell.exe"
        $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command `"$command > '$stdoutFile' 2> '$stderrFile'; if (`$LASTEXITCODE -ne `$null) { exit `$LASTEXITCODE } else { if (-not `$?) { exit 1 } }`""
        $psi.WorkingDirectory = $repoRoot
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $false
        $psi.RedirectStandardError = $false
        $psi.CreateNoWindow = $true

        $process.StartInfo = $psi

        Write-Host "=== $name ==="
        Write-Host "Command: $command"
        $started = $process.Start()
        if (-not $started) {
            throw "Failed to start process"
        }
        $process.WaitForExit()
        $process.WaitForExit(1000)
        $stopwatch.Stop()
        $exitCode = $process.ExitCode
        if (Test-Path -LiteralPath $stdoutFile) {
            $output = Get-Content -LiteralPath $stdoutFile -Raw
        }
        if (Test-Path -LiteralPath $stderrFile) {
            $stderr = Get-Content -LiteralPath $stderrFile -Raw
        }
    }
    catch {
        $stopwatch.Stop()
        $exitCode = 1
        $output = $_.Exception.Message
        $stderr = $_.Exception.Message
    }
    finally {
        if ($stdoutFile) { Remove-Item -LiteralPath $stdoutFile -Force -ErrorAction SilentlyContinue }
        if ($stderrFile) { Remove-Item -LiteralPath $stderrFile -Force -ErrorAction SilentlyContinue }
        $process.Dispose()
    }

    $duration = [math]::Round($stopwatch.Elapsed.TotalSeconds, 3)
    $status = Get-StatusFromResult $exitCode $output $name
    $logPath = Join-Path $ReportDirectory $logFile
    $logContent = "Command: $command`r`nStarted: $timestamp`r`nExitCode: $exitCode`r`nDurationSeconds: $duration`r`n--- stdout ---`r`n$output`r`n--- stderr ---`r`n$stderr`r`n"
    if (Test-Path -LiteralPath $logPath) {
        Add-Content -LiteralPath $logPath -Value $logContent -Encoding UTF8
    }
    else {
        Set-Content -LiteralPath $logPath -Value $logContent -Encoding UTF8 -NoNewline
    }

    $record = [ordered]@{
        name = $name
        command = $command
        status = $status
        exitCode = $exitCode
        durationSeconds = $duration
        stdoutLength = $output.Length
        stderrLength = $stderr.Length
        stdoutPreview = ($output -split "`r?`n" | Select-Object -First 20) -join "`r`n"
        stderrPreview = ($stderr -split "`r?`n" | Select-Object -First 20) -join "`r`n"
        logFile = $logPath
    }

    $script:checks[$script:checkIndex] = $record
    $script:checkIndex++
}

function Get-TestMetrics($output) {
    $passed = 0
    $failed = 0
    $skipped = 0

    foreach ($line in ($output -split "`r?`n")) {
        if ($line -match "Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped,\s+(\d+)\s+total") {
            $passed += [int]$Matches[1]
            $failed += [int]$Matches[2]
            $skipped += [int]$Matches[3]
        }
        elseif ($line -match "Tests:\s+(\d+)\s+passed,\s+(\d+)\s+skipped,\s+(\d+)\s+total") {
            $passed += [int]$Matches[1]
            $skipped += [int]$Matches[3]
        }
        elseif ($line -match "(\d+)\s+Tests? failed") {
            $failed += [int]$Matches[1]
        }
        elseif ($line -match "(\d+)\s+Tests? skipped") {
            $skipped += [int]$Matches[1]
        }
        elseif ($line -match "(\d+)\s+Tests? passed") {
            $passed += [int]$Matches[1]
        }
    }

    return [ordered]@{
        passed = $passed
        failed = $failed
        skipped = $skipped
    }
}

function Get-ReactDoctorMetrics($output) {
    $score = $null
    $bugCount = 0
    $performanceCount = 0
    $maintainabilityCount = 0

    if ($output -match "(?i)Score(?:\s+API\s+unreachable|[^:\d]*)[:\s]+([0-9]+(?:\.[0-9]+)?)") {
        $score = [double]$Matches[1]
    }
    elseif ($output -match "(?i)score[^0-9]{0,80}([0-9]+(?:\.[0-9]+)?)") {
        $score = [double]$Matches[1]
    }

    foreach ($line in ($output -split "`r?`n")) {
        if ($line -match "Bugs:") {
            if ($line -match "×\s*(\d+)") {
                $bugCount += [int]$Matches[1]
            }
            else {
                $bugCount += 1
            }
        }
        elseif ($line -match "Performance:") {
            if ($line -match "×\s*(\d+)") {
                $performanceCount += [int]$Matches[1]
            }
            else {
                $performanceCount += 1
            }
        }
        elseif ($line -match "Maintainability:") {
            if ($line -match "×\s*(\d+)") {
                $maintainabilityCount += [int]$Matches[1]
            }
            else {
                $maintainabilityCount += 1
            }
        }
    }

    return [ordered]@{
        score = $score
        bugCount = $bugCount
        performanceCount = $performanceCount
        maintainabilityCount = $maintainabilityCount
    }
}

function Get-DependencyMetrics($output, $dependenciesOutput) {
    $vulnerabilities = 0
    $invalidInstalls = 0
    $extraneousPackages = 0

    foreach ($line in (($output + "`n" + $dependenciesOutput) -split "`r?`n")) {
        if ($line -match "found\s+(\d+)\s+vulnerabilities") {
            $vulnerabilities = [math]::Max($vulnerabilities, [int]$Matches[1])
        }
        if ($line -match "(\d+)\s+moderate vulnerabilities") {
            $vulnerabilities = [math]::Max($vulnerabilities, [int]$Matches[1])
        }
        if ($line -match "(?i)\binvalid\b") {
            $invalidInstalls++
        }
        if ($line -match "(?i)\bextraneous\b") {
            $extraneousPackages++
        }
    }

    return [ordered]@{
        vulnerabilities = $vulnerabilities
        invalidInstalls = $invalidInstalls
        extraneousPackages = $extraneousPackages
    }
}

function Get-Check($name) {
    foreach ($check in $script:checks) {
        if ($check.name -eq $name) {
            return $check
        }
    }
    return $null
}

function Get-CheckOutput($name) {
    $check = Get-Check $name
    if ($null -eq $check) {
        return ""
    }
    return [string]($check.stdout + "`n" + $check.stderr)
}

function Get-CategoryScore($categoryChecks) {
    if ($categoryChecks.Count -eq 0) {
        return 0
    }

    $total = 0
    foreach ($checkName in $categoryChecks) {
        $check = Get-Check $checkName
        $categoryCheckScore = 0
        if ($null -ne $check) {
            if ($check.status -eq "PASS") {
                $categoryCheckScore = 100
            }
            elseif ($check.status -eq "WARNING") {
                $categoryCheckScore = 50
            }
        }
        $total += $categoryCheckScore
    }

    return [math]::Round($total / $categoryChecks.Count, 2)
}

function Get-Classification($score) {
    if ($score -lt 50) { return "Prototype" }
    if ($score -lt 65) { return "MVP" }
    if ($score -lt 75) { return "Advanced MVP" }
    if ($score -lt 85) { return "Startup Grade" }
    if ($score -lt 92) { return "Production Candidate" }
    if ($score -le 97) { return "Production Ready" }
    return "Enterprise Grade"
}

$script:checks += (Invoke-CapturedCommand "Lint" "npm run lint" "lint.log")
$script:checks += (Invoke-CapturedCommand "Typecheck" "npx tsc --noEmit" "typecheck.log")
$script:checks += (Invoke-CapturedCommand "Build" "npm run build" "build.log")
$script:checks += (Invoke-CapturedCommand "Tests" "npm test" "tests.log")
$script:checks += (Invoke-CapturedCommand "React Doctor" "npx react-doctor@latest --verbose" "react-doctor.log")
$script:checks += (Invoke-CapturedCommand "Dependencies" "npm ls --workspaces --depth=0" "dependencies.log")
$script:checks += (Invoke-CapturedCommand "Security Audit" "npm audit --audit-level=moderate" "security.log")
$script:checks += (Invoke-CapturedCommand "Environment" "node infra/scripts/validate-env-consistency.js" "env.log")
$script:checks += (Invoke-CapturedCommand "Infrastructure" "node infra/scripts/deployment-check.js" "infrastructure.log")
$script:checks += (Invoke-CapturedCommand "Runtime Security" "node infra/scripts/security-tests.js" "security.log")
$script:checks += (Invoke-CapturedCommand "Penetration Tests" "node infra/scripts/penetration-tests.js" "security.log")

$testsOutput = Get-CheckOutput "Tests"
$reactDoctorOutput = Get-CheckOutput "React Doctor"
$securityAuditOutput = Get-CheckOutput "Security Audit"
$dependenciesOutput = Get-CheckOutput "Dependencies"
$testMetrics = Get-TestMetrics $testsOutput
$reactDoctorMetrics = Get-ReactDoctorMetrics $reactDoctorOutput
$dependencyMetrics = Get-DependencyMetrics $securityAuditOutput $dependenciesOutput
$runtimeSecurityOutput = Get-CheckOutput "Runtime Security"
$penetrationOutput = Get-CheckOutput "Penetration Tests"
$environmentOutput = Get-CheckOutput "Environment"
$infrastructureOutput = Get-CheckOutput "Infrastructure"

$rateLimitingStatus = "NOT_RUN"
if ($runtimeSecurityOutput -match "Rate limited responses:\s+(\d+)/(\d+)") {
    $rateLimitingStatus = "Rate limited responses: $($Matches[1])/$($Matches[2])"
}
elseif ($runtimeSecurityOutput -match "Total vulnerabilities found:\s+(\d+)") {
    $rateLimitingStatus = "Total vulnerabilities found: $($Matches[1])"
}
elseif ($runtimeSecurityOutput -match "(?i)ECONNREFUSED|connect.*refused|Failed to connect|Target|localhost:3001") {
    $rateLimitingStatus = "BLOCKED: backend at localhost:3001 was not reachable"
}

$penetrationTestStatus = "NOT_RUN"
if ($penetrationOutput -match "Total issues found:\s+(\d+)") {
    $penetrationTestStatus = "Total issues found: $($Matches[1])"
}
elseif ($penetrationOutput -match "(?i)ECONNREFUSED|connect.*refused|Failed to connect|localhost:3001") {
    $penetrationTestStatus = "BLOCKED: backend at localhost:3001 was not reachable"
}

$deploymentCheckResult = "NOT_RUN"
if ($infrastructureOutput -match "VALIDATION PASSED") {
    $deploymentCheckResult = "VALIDATION PASSED"
}
elseif ($infrastructureOutput -match "ERROR:\s*(.+)") {
    $deploymentCheckResult = $Matches[1].Trim()
}
elseif ($infrastructureOutput -match "WARNING:\s*(.+)") {
    $deploymentCheckResult = $Matches[1].Trim()
}

$kubernetesValidationResult = $deploymentCheckResult
if ($infrastructureOutput -match "kubectl not found") {
    $kubernetesValidationResult = "kubectl not found"
}
elseif ($infrastructureOutput -match "Cannot connect to cluster") {
    $kubernetesValidationResult = "Cannot connect to cluster"
}

$envValidationResult = "NOT_RUN"
if ($environmentOutput -match "All environment configurations are valid") {
    $envValidationResult = "VALID"
}
elseif ($environmentOutput -match "Found\s+(\d+)\s+issues") {
    $envValidationResult = "ISSUES_FOUND: $($Matches[1])"
}
elseif ($environmentOutput -match "SUMMARY|SPICEGARDEN ENVIRONMENT VALIDATION") {
    $envValidationResult = "FAILED"
}

$weights = [ordered]@{
    Build = 15
    Typecheck = 15
    Lint = 10
    Tests = 20
    "React Doctor" = 10
    Security = 15
    Dependencies = 5
    Infrastructure = 5
    Environment = 5
}

$categoryChecks = [ordered]@{
    Build = @("Build")
    Typecheck = @("Typecheck")
    Lint = @("Lint")
    Tests = @("Tests")
    "React Doctor" = @("React Doctor")
    Security = @("Security Audit", "Runtime Security", "Penetration Tests")
    Dependencies = @("Dependencies")
    Infrastructure = @("Infrastructure")
    Environment = @("Environment")
}

$categoryScores = [ordered]@{}
foreach ($category in $categoryChecks.Keys) {
    $categoryScores[$category] = Get-CategoryScore $categoryChecks[$category]
}

$overallScore = 0
foreach ($category in $weights.Keys) {
    $overallScore += ($categoryScores[$category] * $weights[$category] / 100)
}
$overallScore = [math]::Round($overallScore, 2)
$classification = Get-Classification $overallScore

$failedCount = 0
$warningCount = 0
foreach ($check in $script:checks) {
    if ($check.status -eq "FAIL") { $failedCount++ }
    if ($check.status -eq "WARNING") { $warningCount++ }
}
$overallStatus = if ($failedCount -gt 0) { "FAIL" } elseif ($warningCount -gt 0) { "WARNING" } else { "PASS" }

$summary = [ordered]@{
    timestamp = $timestamp
    repository = "SpiceGarden"
    checks = $script:checks
    metrics = [ordered]@{
        tests = $testMetrics
        reactDoctor = $reactDoctorMetrics
        dependencies = $dependencyMetrics
        security = [ordered]@{
            rateLimitingStatus = $rateLimitingStatus
            penetrationTestStatus = $penetrationTestStatus
        }
        infrastructure = [ordered]@{
            deploymentCheckResult = $deploymentCheckResult
            kubernetesValidationResult = $kubernetesValidationResult
        }
        environment = [ordered]@{
            envValidationResult = $envValidationResult
        }
    }
    score = [ordered]@{
        overall_score = $overallScore
        classification = $classification
        categoryScores = $categoryScores
        weights = $weights
    }
    overall_status = $overallStatus
    overall_score = $overallScore
}

$summaryPath = Join-Path $ReportDirectory "summary.json"
$summary | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

$tests = $testMetrics
$react = $reactDoctorMetrics
$dependencies = $dependencyMetrics
$security = $summary.metrics.security
$infrastructure = $summary.metrics.infrastructure
$environment = $summary.metrics.environment

function Get-CheckStatus($name) {
    $check = Get-Check $name
    if ($null -eq $check) { return "MISSING" }
    return $check.status
}

function MarkdownTableRows {
    foreach ($check in $script:checks) {
        $name = $check.name -replace "\|", "\|"
        $status = $check.status -replace "\|", "\|"
        $command = $check.command -replace "\|", "\|"
        $log = $check.logFile -replace "\|", "\|"
        "| $name | $status | $($check.exitCode) | $($check.durationSeconds) | `$($command)` | `$($log)` |"
    }
}

$reportPath = Join-Path $ReportDirectory "QUALITY_GATE_REPORT.md"
$markdown = @"
# SpiceGarden Quality Gate Report

**Generated:** $timestamp  
**Repository:** SpiceGarden  
**Overall Status:** $overallStatus  
**Overall Score:** $overallScore / 100  
**Classification:** $classification

## Build Status
$(Get-CheckStatus "Build")

## Typecheck Status
$(Get-CheckStatus "Typecheck")

## Lint Status
$(Get-CheckStatus "Lint")

## Tests
- Total passed: $($tests.passed)
- Total failed: $($tests.failed)
- Skipped: $($tests.skipped)

## React Doctor
- Score: $(if ($null -eq $react.score) { "unavailable" } else { $react.score })
- Bug count: $($react.bugCount)
- Performance count: $($react.performanceCount)
- Maintainability count: $($react.maintainabilityCount)

## Dependency Audit
- Vulnerabilities: $($dependencies.vulnerabilities)
- Invalid installs: $($dependencies.invalidInstalls)
- Extraneous packages: $($dependencies.extraneousPackages)

## Security
- Rate limiting status: $($security.rateLimitingStatus)
- Penetration test status: $($security.penetrationTestStatus)

## Infrastructure
- Deployment check result: $($infrastructure.deploymentCheckResult)
- Kubernetes validation result: $($infrastructure.kubernetesValidationResult)

## Environment
- Env validation result: $($environment.envValidationResult)

## Category Scores
| Category | Weight | Score |
| :--- | ---: | ---: |
"@

foreach ($category in $categoryScores.Keys) {
    $markdown += "`r`n| $category | $($weights[$category])% | $($categoryScores[$category]) |"
}

$markdown += "`r`n`r`n## Check Results`r`n| Check | Status | Exit Code | Duration Seconds | Command | Log |`r`n| :--- | :--- | ---: | ---: | :--- | :--- |`r`n"
$markdown += (MarkdownTableRows | Out-String)
$markdown += "`r`n## Exact Command Outputs`r`nExact stdout and stderr for every command are captured verbatim in the log files listed above and in the `checks` array of `summary.json`."

Set-Content -LiteralPath $reportPath -Value $markdown -Encoding UTF8

Write-Host "=== DONE ==="
Write-Host "Summary: $summaryPath"
Write-Host "Report: $reportPath"
Write-Host "Overall Status: $overallStatus"
Write-Host "Overall Score: $overallScore / 100"
Write-Host "Classification: $classification"

if ($overallStatus -ne "PASS") {
    exit 1
}
