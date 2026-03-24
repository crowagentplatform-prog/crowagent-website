#!/usr/bin/env pwsh
# CrowAgent Website Deploy Script
# USE THIS INSTEAD OF raw 'vercel --prod'
# Deploys crowagent-website and verifies crowagent.ai is correct after deploy

Write-Host "Deploying crowagent-website to production..." -ForegroundColor Cyan

# Verify we are in the correct directory
$currentDir = Split-Path -Leaf (Get-Location)
if ($currentDir -ne "crowagent-website") {
    Write-Host "ERROR: Must run from crowagent-website directory. Currently in: $currentDir" -ForegroundColor Red
    Write-Host "cd to C:\Users\bhave\Crowagent Repo\crowagent-website first" -ForegroundColor Yellow
    exit 1
}

# Verify .vercel/project.json points to crowagent-website (not platform)
$projectJson = Get-Content ".vercel/project.json" | ConvertFrom-Json
Write-Host "Deploying to Vercel project: $($projectJson.projectId) ($($projectJson.projectName))" -ForegroundColor Gray

if ($projectJson.projectName -ne "crowagent-website") {
    Write-Host "ERROR: .vercel/project.json points to '$($projectJson.projectName)' — expected 'crowagent-website'" -ForegroundColor Red
    Write-Host "Run: npx vercel link  and select crowagentplatform-progs-projects → crowagent-website" -ForegroundColor Yellow
    exit 1
}

# Deploy
npx vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed." -ForegroundColor Red
    exit 1
}

# Wait for propagation
Write-Host "Waiting 15 seconds for propagation..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Verify
Write-Host "Verifying crowagent.ai..." -ForegroundColor Cyan
$status = (curl -s -o /dev/null -w "%{http_code}" --max-redirs 0 https://crowagent.ai)
$body = (curl -s --max-redirs 0 https://crowagent.ai)

if ($status -ne "200") {
    Write-Host "FAILED: crowagent.ai returned HTTP $status (expected 200)" -ForegroundColor Red
    exit 1
}

if ($body -notmatch "Autonomous Sustainability Intelligence") {
    Write-Host "FAILED: tagline missing from crowagent.ai — wrong content deployed" -ForegroundColor Red
    exit 1
}

if ($body -match "supabase|createClient") {
    Write-Host "FAILED: Supabase found on crowagent.ai — platform app deployed to marketing domain" -ForegroundColor Red
    exit 1
}

Write-Host "VERIFIED: crowagent.ai is healthy" -ForegroundColor Green
Write-Host "  - HTTP 200 confirmed" -ForegroundColor Green
Write-Host "  - Tagline present" -ForegroundColor Green
Write-Host "  - No Supabase references" -ForegroundColor Green
