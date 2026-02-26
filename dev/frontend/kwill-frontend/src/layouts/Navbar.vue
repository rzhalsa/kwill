<template>
    <v-app-bar app color="primary">
        <v-toolbar-title style="font-weight: 700;">
            <router-link to="/" style="text-decoration: none; color: inherit;">
            {{title}}
            </router-link>
        </v-toolbar-title>
        <v-spacer/>
        <v-btn to="/characters" class="mr-2">Characters</v-btn>
        <v-btn>Community</v-btn>
        <v-divider vertical class="mt-3 mb-3"></v-divider>
        <v-btn icon="mdi-account"></v-btn>
        <v-btn icon="mdi-cog"></v-btn>
    </v-app-bar>
</template>
<script setup>
    import {ref} from 'vue';
    const title = ref('Kwill')
</script>