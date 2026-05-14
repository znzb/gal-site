import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://Gal:gal147.0.@cluster0.yasunyk.mongodb.net/game_download_db?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri);

async function initDatabase() {
  try {
    console.log('连接到MongoDB...');
    await client.connect();
    console.log('✅ 连接成功!');

    const db = client.db('game_download_db');

    const categories = [
      { id: '1', name: '安卓直装', icon: 'gamepad-2' },
      { id: '2', name: 'kr资源', icon: 'image' },
      { id: '3', name: '游戏CG', icon: 'image' },
      { id: '4', name: '图集资源', icon: 'images' },
      { id: '5', name: '新人必读', icon: 'book-open' }
    ];

    const games = [
      { id: '1', name: '夏日物语', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20summer%20visual%20novel%20game%20cover%20beautiful%20girl%20beach&image_size=portrait_4_3', description: '一款温馨浪漫的夏日恋爱冒险游戏，讲述主角在海边小镇度过的难忘夏天。', category: '安卓直装', size: '2.5GB', releaseDate: '2024-06-15', downloads: 12500, tags: ['恋爱', '校园', '治愈'] },
      { id: '2', name: '星空幻想', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20starry%20night%20magic%20girl%20sword&image_size=portrait_4_3', description: '穿越星空的奇幻冒险，与神秘少女一同探索未知的世界。', category: '安卓直装', size: '3.2GB', releaseDate: '2024-03-20', downloads: 8900, tags: ['奇幻', '冒险', '魔法'] },
      { id: '3', name: '樱花飘落时', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20game%20cover%20school%20romance&image_size=portrait_4_3', description: '樱花纷飞的季节，一段青春恋爱故事正在上演。', category: '安卓直装', size: '1.8GB', releaseDate: '2024-04-10', downloads: 15600, tags: ['恋爱', '校园', '青春'] },
      { id: '4', name: '永恒之约', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20eternal%20love%20game%20cover%20fantasy%20castle%20romance&image_size=portrait_4_3', description: '跨越时空的永恒约定，一段超越生死的爱情故事。', category: 'kr资源', size: '4.1GB', releaseDate: '2024-01-15', downloads: 9800, tags: ['奇幻', '爱情', '冒险'] },
      { id: '5', name: '校园日记', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20school%20life%20game%20cover%20classroom%20students%20friends&image_size=portrait_4_3', description: '记录校园生活的点点滴滴，重温青春的美好时光。', category: 'kr资源', size: '2.0GB', releaseDate: '2024-05-28', downloads: 7200, tags: ['校园', '日常', '友情'] },
      { id: '6', name: '幻想世界', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20world%20game%20cover%20dragons%20magic%20heroes&image_size=portrait_4_3', description: '在充满魔法的幻想世界中展开冒险，成为传奇英雄。', category: '安卓直装', size: '5.5GB', releaseDate: '2024-02-28', downloads: 11200, tags: ['奇幻', '冒险', '战斗'] },
      { id: '7', name: '游戏CG精选', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20CG%20collection%20beautiful%20artwork%20gallery&image_size=portrait_4_3', description: '精选游戏CG合集，包含各种精美游戏插画。', category: '游戏CG', size: '1.2GB', releaseDate: '2024-06-01', downloads: 5600, tags: ['CG', '插画', '合集'] },
      { id: '8', name: '高清图集', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20high%20quality%20image%20collection%20beautiful%20girls&image_size=portrait_4_3', description: '高清精美图集，包含各种主题的精美图片。', category: '图集资源', size: '3.8GB', releaseDate: '2024-05-15', downloads: 8200, tags: ['图集', '高清', '壁纸'] }
    ];

    const features = [
      { id: '1', name: '网站公告', icon: 'megaphone' },
      { id: '2', name: '加入Q群', icon: 'message-circle' },
      { id: '3', name: '柚子社', icon: 'music' },
      { id: '4', name: '工具下载', icon: 'download' }
    ];

    const banners = [
      { id: '1', image: '/banners/banner1.jpg', title: '夏空彼方', subtitle: 'Summer Pockets' },
      { id: '2', image: '/banners/banner2.jpg', title: '千恋*万花', subtitle: 'Senren Banka' },
      { id: '3', image: '/banners/banner3.jpg', title: '魔女的夜宴', subtitle: "Witch's Night" },
      { id: '4', image: '/banners/banner4.jpg', title: '天使☆嚣嚣 RE-BOOT', subtitle: 'Tenshi Hoshii' }
    ];

    await db.collection('categories').deleteMany({});
    await db.collection('games').deleteMany({});
    await db.collection('features').deleteMany({});
    await db.collection('banners').deleteMany({});

    await db.collection('categories').insertMany(categories);
    console.log(`✅ 插入 ${categories.length} 个分类`);

    await db.collection('games').insertMany(games);
    console.log(`✅ 插入 ${games.length} 个游戏`);

    await db.collection('features').insertMany(features);
    console.log(`✅ 插入 ${features.length} 个功能`);

    await db.collection('banners').insertMany(banners);
    console.log(`✅ 插入 ${banners.length} 个轮播图`);

    console.log('\n🎉 数据库初始化完成!');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initDatabase();