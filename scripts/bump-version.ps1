# Get the bump type from arguments (defaults to 'patch')
param(
    [string]$BumpType = 'patch'
)

# Change to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Run the Node.js script
node bump-version.js $BumpType

# If successful, execute the git commands
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nCommitting and pushing changes..."
    $modulePath = Join-Path (Split-Path $scriptPath) "module.json"
    git add $modulePath
    git commit -m "chore: Bump version (automated)"
    git push origin main
    Write-Host "Version bump complete!"
} else {
    Write-Host "Error: Version bump failed" -ForegroundColor Red
} 