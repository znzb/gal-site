import { createApp } from 'vue';
import AdminRouter from './admin/router';
import App from './admin/App.vue';

const app = createApp(App);
app.use(AdminRouter);
app.mount('#admin-app');
