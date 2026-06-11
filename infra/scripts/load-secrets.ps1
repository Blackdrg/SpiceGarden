# Secret loader for PowerShell environments
# Usage: . .\infra\scripts\load-secrets.ps1

$SecretsDir = $env:SECRETS_DIR ?? "C:\Users\mehta\Desktop\SpiceGarden\secrets"

# Load secrets into environment variables
$JwtSecret = Get-Content -Path "$SecretsDir\jwt_secret.txt" -ErrorAction SilentlyContinue
$EncryptionSecret = Get-Content -Path "$SecretsDir\encryption_secret.txt" -ErrorAction SilentlyContinue
$DbPassword = Get-Content -Path "$SecretsDir\db_password.txt" -ErrorAction SilentlyContinue

$env:JWT_SECRET = $JwtSecret
$env:ENCRYPTION_SECRET = $EncryptionSecret
$env:POSTGRES_PASSWORD = $DbPassword

Write-Host "Secrets loaded from $SecretsDir"
if ($JwtSecret) {
    Write-Host "JWT_SECRET: $($JwtSecret.Substring(0, 8))... ($($JwtSecret.Length) chars)"
}
if ($EncryptionSecret) {
    Write-Host "ENCRYPTION_SECRET: $($EncryptionSecret.Substring(0, 8))... ($($EncryptionSecret.Length) chars)"
}