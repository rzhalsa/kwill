<template>
    <v-app-bar app class="gradient-navbar">
        <v-toolbar-title style="font-weight: 700;" >
            <router-link to="/" style="text-decoration: none; color: inherit;">
            <img src="../assets/icon2.png" style="height:100px; width: 100px;" />
            </router-link>
        </v-toolbar-title>
        <v-spacer/>
        <div class="text-center mr-2">
            <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" append-icon="mdi-chevron-down">Menu</v-btn>
                </template>
                <v-list>
                    <v-list-item v-for="(item, index) in items" :key="index" :value="index" class="menu-item">
                        <router-link :to="item.route" style="text-decoration: none; color: inherit;">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </router-link>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <v-menu open-on-hover>
            <v-btn to="/characters" class="mr-2" append-icon="mdi-chevron-down">Menus</v-btn>
        </v-menu>
        <v-divider vertical class="mt-3 mb-3"></v-divider>
        <v-btn icon="mdi-cog" class="mx-2"></v-btn>
        <v-btn icon="mdi-account" class="mr-2"></v-btn>
    </v-app-bar>
</template>
<script setup>
    import {ref} from 'vue';
import router from '../router';
    const title = ref('Kwill');
    const items =[
        {title: 'Characters', route:'/characters'},
        {title: 'Community',route:'/characters'},
        {title: 'Account',route:'/characters'},
        {title: 'Guides',route:'/characters'},
        {title: 'About',route:'/info'},
    ]
</script>
<style>

</style>