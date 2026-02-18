import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Characters from '../pages/Characters.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/characters', component: Characters }
]

export default createRouter({
  history: createWebHistory(),
  routes
})