import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import GameDetail from '@/views/GameDetail.vue'
import Category from '@/views/Category.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router