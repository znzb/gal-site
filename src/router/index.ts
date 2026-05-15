import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import GameDetail from '@/views/GameDetail.vue'
import Category from '@/views/Category.vue'
import AnnouncementsPage from '@/views/AnnouncementsPage.vue'
import JoinGroupPage from '@/views/JoinGroupPage.vue'
import YuzusoftPage from '@/views/YuzusoftPage.vue'
import PatchRecordsPage from '@/views/PatchRecordsPage.vue'
import SearchPage from '@/views/SearchPage.vue'
import ToolDownloadPage from '@/views/ToolDownloadPage.vue'
import PCResourcePage from '@/views/PCResourcePage.vue'
import HelpCenterPage from '@/views/HelpCenterPage.vue'
import TutorialDetailPage from '@/views/TutorialDetailPage.vue'
import AdminLayout from '@/admin/AdminLayout.vue'
import Login from '@/admin/views/Login.vue'
import Dashboard from '@/admin/views/Dashboard.vue'
import GamesManage from '@/admin/views/GamesManage.vue'
import CategoriesManage from '@/admin/views/CategoriesManage.vue'
import BannersManage from '@/admin/views/BannersManage.vue'
import AnnouncementsManage from '@/admin/views/AnnouncementsManage.vue'
import PatchRequestsManage from '@/admin/views/PatchRequestsManage.vue'
import SearchLogsManage from '@/admin/views/SearchLogsManage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: GameDetail
  },
  {
    path: '/category/:type',
    name: 'Category',
    component: Category
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: AnnouncementsPage
  },
  {
    path: '/join-group',
    name: 'JoinGroup',
    component: JoinGroupPage
  },
  {
    path: '/yuzusoft',
    name: 'Yuzusoft',
    component: YuzusoftPage
  },
  {
    path: '/patch-records',
    name: 'PatchRecords',
    component: PatchRecordsPage
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolDownloadPage
  },
  {
    path: '/pc-resources',
    name: 'PCResources',
    component: PCResourcePage
  },
  {
    path: '/help',
    name: 'HelpCenter',
    component: HelpCenterPage
  },
  {
    path: '/tutorial/:id',
    name: 'tutorial-detail',
    component: TutorialDetailPage
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: Login
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'games',
        name: 'GamesManage',
        component: GamesManage
      },
      {
        path: 'categories',
        name: 'CategoriesManage',
        component: CategoriesManage
      },
      {
        path: 'banners',
        name: 'BannersManage',
        component: BannersManage
      },
      {
        path: 'announcements',
        name: 'AnnouncementsManage',
        component: AnnouncementsManage
      },
      {
        path: 'patch-requests',
        name: 'PatchRequestsManage',
        component: PatchRequestsManage
      },
      {
        path: 'search-logs',
        name: 'SearchLogsManage',
        component: SearchLogsManage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// 全局路由守卫：从游戏详情页返回时强制刷新页面
router.beforeEach((to, from, next) => {
  next()
  if (from.path.includes('/game/') && !to.path.includes('/game/')) {
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
})

export default router
