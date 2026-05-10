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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router
