$d = Get-Content 'D:\SpiceGarden\api-verification-full.json' | ConvertFrom-Json
$d.results | Where-Object { $_.path -like '*restaurantId/items*' -or $_.path -like '*bank-accounts/:id*' -or $_.path -like '*tenants/:id*' } | Select-Object method,path,statusCode,status | Format-Table -AutoSize
