import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from './AdminLayout.vue';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import GamesManage from './views/GamesManage.vue';
import CategoriesManage from './views/CategoriesManage.vue';
import BannersManage from './views/BannersManage.vue';
import AnnouncementsManage from './views/AnnouncementsManage.vue';
import PatchRequestsManage from './views/PatchRequestsManage.vue';
import SearchLogsManage from './views/SearchLogsManage.vue';
import ToolsManage from './views/ToolsManage.vue';

const routes = [
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
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('adminToken');
  if (to.path.startsWith('/admin') && to.path !== '/admin/login' && !token) {
    next('/admin/login');
  } else {
    next();
  }
});

export default router;
