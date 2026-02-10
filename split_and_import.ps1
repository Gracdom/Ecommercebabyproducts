# Script para dividir el archivo SQL en lotes y ejecutarlos
$sqlFile = "import_ebaby_productos_data.sql"
$batchSize = 100  # Número de INSERT statements por lote

Write-Host "Leyendo archivo SQL..." -ForegroundColor Yellow

$content = Get-Content $sqlFile -Raw -Encoding UTF8

# Dividir por INSERT statements (cada INSERT puede tener múltiples VALUES)
# Buscar todos los INSERT statements
$inserts = [regex]::Matches($content, "INSERT INTO.*?\);")

Write-Host "Encontrados $($inserts.Count) INSERT statements" -ForegroundColor Green

# Crear lotes
$batches = @()
$currentBatch = ""
$count = 0

foreach ($insert in $inserts) {
    if ($count -eq 0) {
        # Obtener la parte del INSERT hasta VALUES
        $insertStart = $insert.Value -replace "VALUES.*", "VALUES "
        $currentBatch = $insertStart
    }
    
    # Extraer solo los VALUES de este INSERT
    $values = [regex]::Match($insert.Value, "VALUES (.*)\);").Groups[1].Value
    $currentBatch += $values
    
    $count++
    
    if ($count -ge $batchSize) {
        $currentBatch += ";"
        $batches += $currentBatch
        $currentBatch = ""
        $count = 0
    } else {
        $currentBatch += ", "
    }
}

# Agregar el último lote si hay contenido
if ($currentBatch -ne "") {
    $currentBatch = $currentBatch -replace ", $", ";"
    $batches += $currentBatch
}

Write-Host "Creados $($batches.Count) lotes" -ForegroundColor Green

# Guardar lotes en archivos separados
for ($i = 0; $i -lt $batches.Count; $i++) {
    $batchFile = "import_batch_$($i+1).sql"
    Set-Content -Path $batchFile -Value $batches[$i] -Encoding UTF8
    Write-Host "Creado: $batchFile" -ForegroundColor Cyan
}

Write-Host "`nPara ejecutar los lotes, usa:" -ForegroundColor Yellow
Write-Host "foreach (`$f in Get-ChildItem import_batch_*.sql) { ... }" -ForegroundColor Gray
