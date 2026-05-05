import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import CharacterCreator from '../pages/CharacterCreator.vue'
import Characters from '../pages/Characters.vue'
import Login from '../pages/Login.vue'
import Guide from '../pages/Guide.vue'
import Create from '../pages/CreateAccount.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/charactercreator', component: CharacterCreator},
  { path: '/characters', component: Characters },
  { path: '/login', component: Login },
  { path: '/guide', component: Guide},
  { path: '/createaccount', component: Create}
]

export default createRouter({
  history: createWebHistory(),
  routes
})