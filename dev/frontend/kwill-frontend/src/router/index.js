import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import CharacterCreator from '../pages/CharacterCreator.vue'
import Characters from '../pages/Characters.vue'
import Login from '../pages/Login.vue'
import Info from '../pages/Info.vue'
import Create from '../pages/CreateAccount.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/charactercreator', component: CharacterCreator},
  { path: '/characters', component: Characters },
  { path: '/login', component: Login },
  { path: '/info', component: Info},
  { path: '/createaccount', component: Create}
]

export default createRouter({
  history: createWebHistory(),
  routes
})