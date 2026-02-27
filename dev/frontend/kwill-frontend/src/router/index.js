import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Characters from '../pages/Characters.vue'
import Info from '../pages/Info.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/characters', component: Characters },
  { path: '/info', component: Info}
]

export default createRouter({
  history: createWebHistory(),
  routes
})