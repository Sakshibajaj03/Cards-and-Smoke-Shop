$excel = New-Object -ComObject Excel.Application
$wb = $excel.Workbooks.Open("C:\Users\HP\Desktop\all files\store-data-template (3).xlsx")
$ws = $wb.Worksheets.Item(1)
$ws.SaveAs("C:\Users\HP\Desktop\all files\store-data-template-temp.csv", 6)
$wb.Close($false)
$excel.Quit()

