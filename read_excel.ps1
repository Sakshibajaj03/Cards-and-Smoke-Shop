$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open('C:\Users\HP\Desktop\all files\store-data-template (3).xlsx')

$sheets = @()
for ($i = 1; $i -le $wb.Sheets.Count; $i++) {
    $sheets += $wb.Sheets.Item($i).Name
}

$sheets | Out-File -FilePath 'sheets.txt'

# Export Products sheet to CSV if it exists
$productsSheet = $wb.Sheets | Where-Object { $_.Name -like "*Product*" }
if ($productsSheet) {
    $productsSheet.SaveAs("C:\Users\HP\Desktop\all files\products_temp.csv", 6) # 6 = csv
}

# Export Brands sheet to CSV if it exists
$brandsSheet = $wb.Sheets | Where-Object { $_.Name -like "*Brand*" }
if ($brandsSheet) {
    $brandsSheet.SaveAs("C:\Users\HP\Desktop\all files\brands_temp.csv", 6)
}

# Export Flavors sheet to CSV if it exists
$flavorsSheet = $wb.Sheets | Where-Object { $_.Name -like "*Flavor*" -or $_.Name -like "*Flavour*" }
if ($flavorsSheet) {
    $flavorsSheet.SaveAs("C:\Users\HP\Desktop\all files\flavors_temp.csv", 6)
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null

