export interface Game {
  id: string
  name: string
  cover: string
  description: string
  category: string
  size: string
  releaseDate: string
  downloads: number
  tags: string[]
}

export interface CategoryItem {
  id: string
  name: string
  icon: string
  order: number
}

export interface Feature {
  id: string
  name: string
  icon: string
}

export interface Banner {
  id: string
  image: string
  title: string
  subtitle: string
}

export const categories: CategoryItem[] = [
  { id: '1', name: '游戏CG', icon: '🎨' },
  { id: '2', name: '图集资源', icon: '🖼️' },
  { id: '3', name: '新人必读', icon: '📖' },
  { id: '4', name: 'PC资源', icon: '🖥️' },
  { id: '5', name: 'Gal游戏', icon: '🎮' },
  { id: '6', name: '柚子社', icon: '🎵' }
]

export const games: Game[] = [
  {
    id: '7',
    name: '游戏CG精选',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20CG%20collection%20beautiful%20artwork%20gallery&image_size=portrait_4_3',
    description: '精选游戏CG合集，包含各种精美游戏插画。',
    category: '游戏CG',
    size: '1.2GB',
    releaseDate: '2024-06-01',
    downloads: 5600,
    tags: ['CG', '插画', '合集']
  },
  {
    id: '8',
    name: '高清图集',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20high%20quality%20image%20collection%20beautiful%20girls&image_size=portrait_4_3',
    description: '高清精美图集，包含各种主题的精美图片。',
    category: '图集资源',
    size: '3.8GB',
    releaseDate: '2024-05-15',
    downloads: 8200,
    tags: ['图集', '高清', '壁纸']
  },
  {
    id: 'pc1',
    name: '恋爱物语~夏日回忆',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20visual%20novel%20game%20cover%20summer%20beach%20romance&image_size=portrait_4_3',
    description: '一款精美的恋爱冒险游戏，在夏日的海边小镇展开一段浪漫的爱情故事。',
    category: 'PC资源',
    size: '8.5GB',
    releaseDate: '2024-06-15',
    downloads: 12500,
    tags: ['恋爱', '校园', '治愈']
  },
  {
    id: 'pc2',
    name: '永恒幻想',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20magic%20sword%20heroes&image_size=portrait_4_3',
    description: '史诗级奇幻冒险游戏，探索神秘的魔法世界，成为传奇英雄。',
    category: 'PC资源',
    size: '12.3GB',
    releaseDate: '2024-03-20',
    downloads: 8900,
    tags: ['奇幻', '冒险', '战斗']
  },
  {
    id: 'pc3',
    name: '樱花树下的约定',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20school%20romance&image_size=portrait_4_3',
    description: '在樱花纷飞的季节，邂逅一段纯真的校园爱情故事。',
    category: 'PC资源',
    size: '6.8GB',
    releaseDate: '2024-04-10',
    downloads: 15600,
    tags: ['恋爱', '校园', '青春']
  },
  {
    id: 'pc4',
    name: '星际旅者',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20space%20adventure%20game%20cover%20spaceship%20stars&image_size=portrait_4_3',
    description: '穿越浩瀚宇宙，探索未知星球，展开一段惊心动魄的星际冒险。',
    category: 'PC资源',
    size: '15.2GB',
    releaseDate: '2024-01-15',
    downloads: 9800,
    tags: ['科幻', '冒险', '探索']
  },
  {
    id: 'pc5',
    name: '机械之心',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20robot%20mecha%20game%20cover%20sci-fi&image_size=portrait_4_3',
    description: '在机械与人类共存的世界，探索人工智能的情感与意识。',
    category: 'PC资源',
    size: '10.1GB',
    releaseDate: '2024-05-20',
    downloads: 7200,
    tags: ['科幻', '剧情', '机器人']
  },
  {
    id: 'pc6',
    name: '魔法学园',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20magic%20academy%20game%20cover%20wizard&image_size=portrait_4_3',
    description: '进入魔法学院，学习各种神奇的魔法，与伙伴们一起冒险。',
    category: 'PC资源',
    size: '9.8GB',
    releaseDate: '2024-02-15',
    downloads: 11000,
    tags: ['魔法', '学园', '冒险']
  }
]

export const features: Feature[] = [
  { id: '1', name: '网站公告', icon: 'megaphone' },
  { id: '2', name: '柚子社', icon: 'music' },
  { id: '3', name: '工具下载', icon: 'download' },
  { id: '4', name: '加入Q群', icon: 'message-circle' }
]

export const banners: Banner[] = [
  {
    id: '1',
    image: '/banners/banner1.jpg',
    title: '夏空彼方',
    subtitle: 'Summer Pockets'
  },
  {
    id: '2',
    image: '/banners/banner2.jpg',
    title: '千恋*万花',
    subtitle: 'Senren Banka'
  },
  {
    id: '3',
    image: '/banners/banner3.jpg',
    title: '魔女的夜宴',
    subtitle: "Witch's Night"
  },
  {
    id: '4',
    image: '/banners/banner4.jpg',
    title: '天使☆嚣嚣 RE-BOOT',
    subtitle: 'Tenshi Hoshii'
  }
]