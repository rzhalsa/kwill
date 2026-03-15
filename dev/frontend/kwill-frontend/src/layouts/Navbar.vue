<template>
    <v-app-bar app class="gradient-navbar">
        <v-toolbar-title style="font-weight: 700;" >
            <router-link to="/" style="text-decoration: none; color: inherit;">
            <img src="../assets/icon2.png" style="height:100px; width: 100px;" />
            </router-link>
        </v-toolbar-title>
        <v-spacer/>
        <div class="text-center mr-2">
            <!-- Menu drop down -->
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
        <v-btn icon="mdi-cog" class="ml-2"></v-btn>
        <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>
        <v-divider vertical class="ma-3"></v-divider>
        <div>
            <!-- Account drop down -->
            <v-menu open-on-hover color="black" v-if="user">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="white" variant="outlined" rounded="pill" class="mr-2" icon="mdi-account" size="x-small"></v-btn>
                </template>
                <v-list>
                    <v-list-subheader>{{ user.username }}</v-list-subheader>
                    <v-list-item v-for="item in account_items" :key="item.title" class="menu-item" @click="item.exec()">
                        <v-list-item-title>
                            <v-icon>{{ item.icon }}</v-icon>
                            {{ item.title }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <!-- Sign in button -->
            <v-btn variant="elevated" rounded="pill" small to="/login" class="mr-2" v-else>
                <v-icon left>mdi-account</v-icon>
                Sign in
            </v-btn>
        </div>
    </v-app-bar>
</template>
<script setup>
    import {ref} from 'vue';
    import { useTheme } from 'vuetify'
    import router from '../router';
    const theme = useTheme()
    const title = ref('Kwill');
    // List of items to show on the Menu drop down
    const items =[
        {title: 'Characters', route:'/characters'},
        {title: 'Community',route:'/characters'},
        {title: 'Account',route:'/characters'},
        {title: 'Guides',route:'/characters'},
        {title: 'About',route:'/info'},
    ]
    // List of items to show on the account drop down
    const account_items = [
        {title: 'Log out', icon:'mdi-logout', exec: logout}
    ]
    const user = ref(JSON.parse(localStorage.getItem('user')))

    // Logs the user out
    function logout() {
        localStorage.removeItem('user')
        user.value = null
    }

    // Toggles between light and dark vuetify themes
    function toggleTheme() {
        if(theme.global.name.value === 'kwillTheme') {
            theme.global.name.value = 'kwillThemeDark'
        } else {
            theme.global.name.value = 'kwillTheme'
        }
    }
</script>

<style>
</style>