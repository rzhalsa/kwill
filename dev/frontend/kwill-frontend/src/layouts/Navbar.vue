<template>
    <v-app-bar app color="primary">
        <v-row>
            <v-col cols="12"></v-col>
        </v-row>
        <v-toolbar-title style="font-weight: 700;">{{title}}</v-toolbar-title>
        <v-spacer/>
        <v-btn text="Test" to="/" title="Home">
            <v-icon>mdi-home</v-icon>
        </v-btn>
         <v-btn text to="/characters" title="Characters">
            <v-icon>mdi-account-box-multiple</v-icon>
         </v-btn>
    </v-app-bar>
</template>
<script setup>
    import {ref} from 'vue';
    const title = ref('Kwill')
</script>