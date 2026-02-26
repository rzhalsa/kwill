<template>
    <v-app-bar app class="gradient-navbar">
        <v-toolbar-title style="font-weight: 700;" >
            <router-link to="/" style="text-decoration: none; color: inherit;">
            <img src="../assets/icon.png" style="width: 100px; height: 100px;"/>
            </router-link>
        </v-toolbar-title>
        <v-spacer/>
        <v-btn to="/characters" class="mr-2">Characters</v-btn>
        <v-btn class="mr-2">Community</v-btn>
        <v-divider vertical class="mt-3 mb-3"></v-divider>
        <v-btn icon="mdi-cog" class="mx-2"></v-btn>
        <v-btn icon="mdi-account" class="mr-2"></v-btn>
    </v-app-bar>
</template>
<script setup>
    import {ref} from 'vue';
    const title = ref('Kwill')
</script>
<style>

</style>