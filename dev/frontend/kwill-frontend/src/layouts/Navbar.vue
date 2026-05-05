<template>
    <v-app-bar app class="gradient-navbar">
        <!-- Logo -->
        <v-toolbar-title style="font-weight: 700;" v-if="theme.global.name.value==='kwillTheme'">
            <router-link to="/" style="text-decoration: none; color: inherit;">
            <img src="../assets/icon.png" style="height:100px; width: 100px;" />
            </router-link>
        </v-toolbar-title>
        <v-toolbar-title style="font-weight: 700;" v-else>
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
        <!-- GitHub logo -->
        <a href="https://github.com/rzhalsa/kwill" style="color: inherit !important;" class="v-btn v-btn--icon app-btn mr-3">
            <span class="v-btn__content" data-no-activator="">
                <i class="v-icon notranslate v-theme--dark" aria-hidden="true" style="font-size: 24px; height: 24px; width: 24px;"><svg class="v-icon__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"></path></svg>
                </i>
            </span>
        </a>
        <div>
            <!-- Account drop down -->
            <v-menu open-on-hover v-if="user">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="outlined" rounded="pill" class="mr-2" icon="mdi-account" size="x-small"></v-btn>
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
    import {ref, computed} from 'vue';
    import { useTheme } from 'vuetify'
    import router from '../router';
    import { useAuthStore } from '../stores/user_login_state';
    const theme = useTheme()
    const authStore = useAuthStore();
    const title = ref('Kwill');
    const user = computed(() => authStore.user);
    // List of items to show on the Menu drop down
    const items = [
        {title: 'Characters', route:'/characters'},
        {title: 'Guide',route:'/guide'},
        {title: 'Account',route:'/characters'},
    ]
    // List of items to show on the account drop down
    const account_items = [
        {title: 'Log out', icon:'mdi-logout', exec: logout}
    ]

    // Logs the user out
    function logout() {
        authStore.logout();
    }

    // Toggles between light and dark vuetify themes
    function toggleTheme() {
        if(theme.global.name.value === 'kwillTheme') {
            theme.change('kwillThemeDark')
        } else {
            theme.change('kwillTheme')
        }
    }
</script>

<style>
</style>