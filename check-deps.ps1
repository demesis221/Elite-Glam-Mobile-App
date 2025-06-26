# Check for missing dependencies
$projectRoot = Get-Location
$packageJson = [System.IO.File]::ReadAllText("$projectRoot/package.json") | ConvertFrom-Json
$installedDeps = @()

# Get all installed dependencies
if ($packageJson.dependencies) {
    $installedDeps += $packageJson.dependencies.PSObject.Properties.Name
}
if ($packageJson.devDependencies) {
    $installedDeps += $packageJson.devDependencies.PSObject.Properties.Name
}

# Get all .ts, .tsx, .js, .jsx files
$files = Get-ChildItem -Path $projectRoot -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Recurse -File

$imports = @()

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    # Find import/require statements
    $importMatches = [regex]::Matches($content, "(?:import\s+.*\s+from\s+['`"]([^'`""`"\/\.][^'`""`"\/]*)['`""`"]|require\s*\(\s*['`"]([^'`""`"\/\.][^'`""`"\/]*)['`""`"])")
    foreach ($match in $importMatches) {
        $import = if ($match.Groups[1].Success) { $match.Groups[1].Value } else { $match.Groups[2].Value }
        # Skip relative imports and core modules
        if ($import -notmatch '^\.' -and -not (Test-Path "node_modules/$import" -PathType Container) -and -not (Get-Command $import -ErrorAction SilentlyContinue)) {
            $imports += $import
        }
    }
}

# Find unique imports and filter out known Node.js core modules
$coreModules = @('fs', 'path', 'http', 'https', 'util', 'os', 'events', 'child_process', 'crypto', 'stream', 'url', 'zlib')
$uniqueImports = $imports | Sort-Object -Unique | Where-Object { $coreModules -notcontains $_ }

# Find missing dependencies
$missingDeps = $uniqueImports | Where-Object { 
    $pkgName = $_
    -not ($installedDeps -contains $pkgName) -and 
    -not ($installedDeps | Where-Object { $_ -like "$pkgName/*" -or $_ -like "*/$pkgName" })
}

# Display results
if ($missingDeps) {
    Write-Host "`nPotentially missing dependencies:" -ForegroundColor Yellow
    $missingDeps | ForEach-Object { Write-Host "- $_" }
} else {
    Write-Host "`nNo missing dependencies found!" -ForegroundColor Green
}

# Check for peer dependencies
if (Test-Path "$projectRoot/node_modules") {
    try {
        $peerDeps = npm ls --depth=0 --json 2>&1 | Out-String | ConvertFrom-Json
        if ($peerDeps.problems) {
            Write-Host "`nPeer dependency issues found:" -ForegroundColor Yellow
            $peerDeps.problems | ForEach-Object { Write-Host "- $_" }
        }
    } catch {
        Write-Host "`nCould not check for peer dependencies. Make sure to run 'npm install' first." -ForegroundColor Red
    }
}