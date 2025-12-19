$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open('C:\Users\Vrshi0903\OneDrive\Desktop\all files (2)\all files\store-data-template (3).xlsx')
    
    # Export Products sheet to CSV
    $productsSheet = $wb.Sheets | Where-Object { $_.Name -like "*Product*" }
    if ($productsSheet) {
        $productsSheet.SaveAs("C:\Users\Vrshi0903\OneDrive\Desktop\Backup\Backup\Web\Website - old\products_imported.csv", 6)
        Write-Host "Products exported."
    }
    
    # Export Brands sheet to CSV
    $brandsSheet = $wb.Sheets | Where-Object { $_.Name -like "*Brand*" }
    if ($brandsSheet) {
        $brandsSheet.SaveAs("C:\Users\Vrshi0903\OneDrive\Desktop\Backup\Backup\Web\Website - old\brands_imported.csv", 6)
        Write-Host "Brands exported."
    }
    
    # Export Flavors sheet to CSV
    $flavorsSheet = $wb.Sheets | Where-Object { $_.Name -like "*Flavor*" -or $_.Name -like "*Flavour*" }
    if ($flavorsSheet) {
        $flavorsSheet.SaveAs("C:\Users\Vrshi0903\OneDrive\Desktop\Backup\Backup\Web\Website - old\flavors_imported.csv", 6)
        Write-Host "Flavors exported."
    }
    
    $wb.Close($false)
} catch {
    Write-Error "Error: $_"
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}

