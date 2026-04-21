import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/user_login_state';
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import '@mdi/font/css/materialdesignicons.css'
import './main.css'

const pinia = createPinia()

createApp(App)
  .use(vuetify)
  .use(router)
  .use(pinia)
  .mount('#app')

//Prevents user from not logging out upon page refresh.
const token = localStorage.getItem("token");
if (token) {
    const authStore = useAuthStore();
    authStore.setToken(token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}