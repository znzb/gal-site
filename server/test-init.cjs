const https = require('https');

const options = {
  hostname: 'game-api-p1zc.onrender.com',
  port: 443,
  path: '/api/init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 0
  }
};

console.log('正在初始化数据库...');
console.log('API地址: https://game-api-p1zc.onrender.com/api/init\n');

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n响应数据:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.counts) {
        console.log('\n✅ 数据初始化成功!');
        console.log(`   - 分类: ${json.counts.categories} 个`);
        console.log(`   - 游戏: ${json.counts.games} 个`);
        console.log(`   - 功能: ${json.counts.features} 个`);
        console.log(`   - 轮播图: ${json.counts.banners} 个`);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.end();