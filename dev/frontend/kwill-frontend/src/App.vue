
<template>
   <v-app>
    <Navbar v-if="showNavbar"/>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import Navbar from './layouts/Navbar.vue'
  import Login from './pages/Login.vue'
  
  const showNavbar = ref(true)

  function toggleNavbar(show) {
    console.log(show)
    showNavbar.value = show
  }
</script>
