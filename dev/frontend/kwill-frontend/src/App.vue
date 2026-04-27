<template>
	<v-app>
    	<Navbar v-if="navbarState"/>
    	<v-main>
      		<router-view />
    	</v-main>
  	</v-app>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useNavbarStore } from './stores/navbar_state'
  import Navbar from './layouts/Navbar.vue'
  
  const store = useNavbarStore()
  const navbarState = computed(() => store.getUseNavBar)
</script>
