import { createApp } from 'vue';
import AdminRouter from './admin/router';
import AdminLayout from './admin/AdminLayout.vue';

const app = createApp(AdminLayout);
app.use(AdminRouter);
app.mount('#admin-app');