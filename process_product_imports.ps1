# Script para procesar los archivos SQL y adaptarlos para ebaby_productos
$sourceFile1 = "d:\DESCARGA\products_rows (1).sql"
$sourceFile2 = "d:\DESCARGA\products_rows (2).sql"
$outputFile = "import_ebaby_productos_data.sql"

Write-Host "Procesando archivos SQL..." -ForegroundColor Green

function Process-SqlFile {
    param (
        [string]$InputFile,
        [string]$OutputFile,
        [bool]$Append = $false
    )
    
    if (-not (Test-Path $InputFile)) {
        Write-Host "Archivo no encontrado: $InputFile" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Procesando: $InputFile" -ForegroundColor Yellow
    
    $content = Get-Content $InputFile -Raw -Encoding UTF8
    
    # Reemplazar el nombre de la tabla
    $content = $content -replace 'INSERT INTO "public"."products"', 'INSERT INTO "public"."ebaby_productos"'
    
    # Convertir 'NULL' (string) a NULL (SQL)
    $content = $content -replace ",'NULL',", ',NULL,'
    $content = $content -replace ",'NULL'\)", ',NULL)'
    
    # Guardar el contenido procesado
    if ($Append) {
        Add-Content -Path $OutputFile -Value $content -Encoding UTF8
    } else {
        Set-Content -Path $OutputFile -Value $content -Encoding UTF8
    }
    
    Write-Host "Procesado: $InputFile" -ForegroundColor Green
    return $true
}

# Procesar primer archivo
$success1 = Process-SqlFile -InputFile $sourceFile1 -OutputFile $outputFile -Append $false

# Procesar segundo archivo
if ($success1) {
    $success2 = Process-SqlFile -InputFile $sourceFile2 -OutputFile $outputFile -Append $true
    
    if ($success2) {
        Write-Host ""
        Write-Host "Archivos procesados exitosamente!" -ForegroundColor Green
        Write-Host "Archivo generado: $outputFile" -ForegroundColor Cyan
    }
}
