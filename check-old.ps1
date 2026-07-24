$d = Get-Content 'D:\SpiceGarden\api-verification-full.json' | ConvertFrom-Json
$d.results | Where-Object { $_.path -like '*chatbot*' -or $_.path -like '*reroute*' -or $_.path -like '*platform/stats*' } | Select-Object method,path,statusCode,status | Format-Table -AutoSize
