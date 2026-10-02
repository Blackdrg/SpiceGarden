# infra/load-tests/1m/distributed/distributed-runner.ps1
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "SPICEGARDEN 1M VU DISTRIBUTED TEST EXECUTION HARNESS (PS)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Resolve kubectl command
$kubectlCmd = Get-Command kubectl.exe -ErrorAction SilentlyContinue
if (-not $kubectlCmd) {
  $kubectlCmd = Get-Command kubectl -ErrorAction SilentlyContinue
}

if (-not $kubectlCmd) {
  Write-Host "[ERROR] kubectl was not found in PATH." -ForegroundColor Red
  Write-Host "Please ensure Docker Desktop / Kubernetes or Cloud SDK kubectl is installed and in your PATH."
  exit 1
}

$namespace = "load-testing"
$configMapName = "spicegarden-1m-scenario-cm"
$testRunFile = "infra/load-tests/1m/distributed/k8s-k6-operator.yaml"

Write-Host "[1/4] Validating Kubernetes cluster connectivity..." -ForegroundColor Yellow
try {
  & $kubectlCmd cluster-info
} catch {
  Write-Host "`n[NOTICE] Target Kubernetes cluster is not currently reachable." -ForegroundColor DarkYellow
  Write-Host "Please start your local cluster (Docker Desktop / Minikube) or connect to your cloud cluster (EKS/GKE)." -ForegroundColor DarkYellow
  exit 1
}

Write-Host "[2/4] Creating scenario ConfigMap..." -ForegroundColor Yellow
& $kubectlCmd create namespace $namespace --dry-run=client -o yaml | & $kubectlCmd apply -f -
& $kubectlCmd create configMap $configMapName `
  --from-file=scenario.js=infra/load-tests/1m/scenario.js `
  --from-file=config.js=infra/load-tests/1m/config.js `
  --from-file=thresholds.js=infra/load-tests/1m/thresholds.js `
  --namespace=$namespace --dry-run=client -o yaml | & $kubectlCmd apply -f -

Write-Host "[3/4] Deploying 40-worker k6 distributed TestRun..." -ForegroundColor Yellow
& $kubectlCmd apply -f $testRunFile

Write-Host "[4/4] Monitoring distributed TestRun execution..." -ForegroundColor Yellow
& $kubectlCmd get testruns -n $namespace -w
