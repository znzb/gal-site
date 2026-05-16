import { createRouter, createWebHashHistory } from 'vue-router'
import { dataCache } from '@/utils/cache'
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
import ToolsManage from '@/admin/views/ToolsManage.vue'
import BatchImport from '@/admin/views/BatchImport.vue'
import GroupInfoManage from '@/admin/views/GroupInfoManage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { keepAlive: false }
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: GameDetail,
    meta: { keepAlive: false }
  },
  {
    path: '/category/:type',
    name: 'Category',
    component: Category,
    meta: { keepAlive: false }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: AnnouncementsPage,
    meta: { keepAlive: false }
  },
  {
    path: '/join-group',
    name: 'JoinGroup',
    component: JoinGroupPage,
    meta: { keepAlive: false }
  },
  {
    path: '/yuzusoft',
    name: 'Yuzusoft',
    component: YuzusoftPage,
    meta: { keepAlive: false }
  },
  {
    path: '/patch-records',
    name: 'PatchRecords',
    component: PatchRecordsPage,
    meta: { keepAlive: false }
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage,
    meta: { keepAlive: false }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolDownloadPage,
    meta: { keepAlive: false }
  },
  {
    path: '/pc-resources',
    name: 'PCResources',
    component: PCResourcePage,
    meta: { keepAlive: false }
  },
  {
    path: '/help',
    name: 'HelpCenter',
    component: HelpCenterPage,
    meta: { keepAlive: false }
  },
  {
    path: '/tutorial/:id',
    name: 'tutorial-detail',
    component: TutorialDetailPage,
    meta: { keepAlive: false }
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
      },
      {
        path: 'tools',
        name: 'ToolsManage',
        component: ToolsManage
      },
      {
        path: 'batch-import',
        name: 'BatchImport',
        component: BatchImport
      },
      {
        path: 'group-info',
        name: 'GroupInfoManage',
        component: GroupInfoManage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

router.afterEach((to, from) => {
  if (to.name !== from.name) {
    dataCache.clear()
  }
})

export default router
