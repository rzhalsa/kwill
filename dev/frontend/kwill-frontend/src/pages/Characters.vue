<template>
    <v-row>
        <v-col cols="3">
            <v-card class="mt-4 ml-4 rounded-lg">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Characters</span>
                    <v-btn title="New Character" icon="mdi-plus"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="9">
            <v-card class="mt-4 mr-4 rounded-lg">
                <v-card-title></v-card-title>
                <v-card-text></v-card-text>
                <v-card-actions></v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
    import {ref} from 'vue';
    const userID = ref(1); //place holder
    const characterID = ref(1);
</script>
