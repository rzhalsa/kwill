import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import CharacterCreator from '../pages/CharacterCreator.vue'
import Characters from '../pages/Characters.vue'
import Login from '../pages/Login.vue'
import Info from '../pages/Info.vue'
import Create from '../pages/CreateAccount.vue'
import account from '../pages/Account.vue'
import { useAuthStore } from '../stores/user_login_state';

const routes = [
  { path: '/', component: Home },
  { path: '/charactercreator', component: CharacterCreator},
  { path: '/account', component: account, meta: { requiresAuth: true }},
  { path: '/characters', component: Characters, meta: { requiresAuth: true }}, // Only logged-in users can access the Characters page
  { path: '/login', component: Login },
  { path: '/info', component: Info},
  { path: '/createaccount', component: Create}
]

const router= createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If we have a token but no user yet, initialize
  if (!authStore.user && authStore.token) {
    await authStore.initializeAuth()
  }

  // If route requires auth and user is not logged in
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    authStore.showLogin = true;
    return next(true);
  }

  next()
})
export default router;