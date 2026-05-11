$ErrorActionPreference = "Stop"

Write-Host "正在登录获取Token..." -ForegroundColor Cyan

$loginResponse = Invoke-RestMethod -Uri "https://game-api-p1zc.onrender.com/api/admin/auth/login" `
  -Method Post `
  -Headers @{
    'Content-Type' = 'application/json; charset=utf-8'
  } `
  -Body (ConvertTo-Json -InputObject @{
    username = 'admin'
    password = 'yxx456.0.'
  })

if ($loginResponse.token) {
  Write-Host "登录成功！" -ForegroundColor Green
  
  Write-Host "`n正在执行分类迁移..." -ForegroundColor Cyan
  
  $mergeResponse = Invoke-RestMethod -Uri "https://game-api-p1zc.onrender.com/api/admin/categories/merge-to-gal" `
    -Method Post `
    -Headers @{
      'Content-Type' = 'application/json; charset=utf-8'
      'Authorization' = "Bearer $($loginResponse.token)"
    }
  
  Write-Host "`n迁移结果：" -ForegroundColor Cyan
  Write-Host "消息: $($mergeResponse.message)" -ForegroundColor White
  
  if ($mergeResponse.migrated) {
    foreach ($item in $mergeResponse.migrated) {
      Write-Host "  - 从 '$($item.from)' 迁移了 $($item.count) 个游戏" -ForegroundColor Yellow
    }
  }
  
  Write-Host "`n迁移完成！" -ForegroundColor Green
} else {
  Write-Host "登录失败: $($loginResponse.error)" -ForegroundColor Red
}
