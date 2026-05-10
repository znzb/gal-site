import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import GameDetail from '@/views/GameDetail.vue'
import Category from '@/views/Category.vue'
import AnnouncementsPage from '@/views/AnnouncementsPage.vue'
import JoinGroupPage from '@/views/JoinGroupPage.vue'
import YuzusoftPage from '@/views/YuzusoftPage.vue'
import PatchRecordsPage from '@/views/PatchRecordsPage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
