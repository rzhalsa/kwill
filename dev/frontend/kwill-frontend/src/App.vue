
<template>
   <v-app>
    <Navbar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import Navbar from './layouts/Navbar.vue'
</script>

<style>
body, html, #app {
  font-family: 'Playwrite NZ Basic', sans-serif;
}
</style>