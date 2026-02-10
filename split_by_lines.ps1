# Script para dividir el archivo SQL en lotes por líneas
$sqlFile = "import_ebaby_productos_data.sql"
$linesPerBatch = 500  # Líneas por lote

Write-Host "Leyendo archivo SQL..." -ForegroundColor Yellow

$lines = Get-Content $sqlFile -Encoding UTF8
$totalLines = $lines.Count
Write-Host "Total de líneas: $totalLines" -ForegroundColor Green

$batchNum = 1
$currentBatch = @()
$batchFiles = @()

for ($i = 0; $i -lt $totalLines; $i++) {
    $currentBatch += $lines[$i]
    
    if (($currentBatch.Count -ge $linesPerBatch) -or ($i -eq $totalLines - 1)) {
        $batchFile = "import_batch_$batchNum.sql"
        $currentBatch -join "`n" | Set-Content -Path $batchFile -Encoding UTF8
        $batchFiles += $batchFile
        Write-Host "Creado: $batchFile ($($currentBatch.Count) líneas)" -ForegroundColor Cyan
        $currentBatch = @()
        $batchNum++
    }
}

Write-Host "`nCreados $($batchFiles.Count) archivos de lote" -ForegroundColor Green
Write-Host "Archivos: $($batchFiles -join ', ')" -ForegroundColor Gray
