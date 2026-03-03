import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Characters from '../pages/Characters.vue'
import Login from '../pages/Login.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/characters', component: Characters },
  { path: '/login', component: Login }
]

export default createRouter({
  history: createWebHistory(),
  routes
})