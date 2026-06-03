# PowerShell script to push project files to GitHub
Clear-Host
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   EcoFeed GitHub Push Automation Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# 1. Verify Git installation
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Host "❌ Git is not installed on your system." -ForegroundColor Rose
    Write-Host "👉 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "👉 After installing Git, reopen PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to close..."
    exit
}

Write-Host "✓ Git detected." -ForegroundColor Green
Write-Host ""

# 2. Git init
if (-not (Test-Path ".git")) {
    Write-Host "📂 Initializing local Git repository..." -ForegroundColor Cyan
    git init
} else {
    Write-Host "📂 Git repository already initialized." -ForegroundColor Cyan
}

# 3. Add files
Write-Host "➕ Staging project files..." -ForegroundColor Cyan
git add --all

# 4. Commit files
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m "Initial commit - Food Waste Management Platform (EcoFeed)"

# 5. Set branch name
Write-Host "🌿 Setting branch to main..." -ForegroundColor Cyan
git branch -M main

# 6. Add Remote origin
$remoteUrl = "https://github.com/SACHIN55135/ecofeed.git"
$existingRemote = git remote | Where-Object { $_ -eq "origin" }
if ($existingRemote) {
    Write-Host "🔗 Updating remote origin to: $remoteUrl" -ForegroundColor Cyan
    git remote set-url origin $remoteUrl
} else {
    Write-Host "🔗 Adding remote origin: $remoteUrl" -ForegroundColor Cyan
    git remote add origin $remoteUrl
}

Write-Host ""
Write-Host "🚀 Pushing files to GitHub..." -ForegroundColor Cyan
Write-Host "⚠️ NOTE: Git will open a login window/browser tab for your GitHub authentication." -ForegroundColor Yellow
Write-Host ""

# 7. Push to remote
git push -u origin main

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "🎉 Finished! Check your repo: https://github.com/SACHIN55135/ecofeed" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit..."
