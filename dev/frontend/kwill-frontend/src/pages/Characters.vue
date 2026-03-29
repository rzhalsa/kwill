<template>
    <v-row>
        <v-col cols="3">
            <v-card class="mt-4 ml-4 rounded-lg">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Characters</span>
                    <v-btn title="New Character" icon="mdi-plus" to="charactercreator"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="9">
            <v-card class="mt-4 mr-4 rounded-lg" style="max-height: 1150px; overflow-y: auto;">
                <v-card-title></v-card-title>
                <v-card-text>
                    <characterSheet ref="sheetRef" @update:char-data="postCharData()"/>
                </v-card-text>
                <v-card-actions></v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
    import characterSheet from '../layouts/Sheet.vue';
    import {ref, onMounted} from 'vue';
    import api from '../services/api';
    const userID = ref(1); //place holder
    const characterID = ref(1);
    const sheetRef = ref();
    const charData = ref();
    function getCharData(){

    }
    function sendCharData(){
        sheetRef.value.populateSheet(charData.value);
        console.log("here");
    }
    async function fetchCharData() {
        try {
            const response = await api.get(`/api/character/${userID.value}/${characterID.value}`)
            const data = response.data;
            console.log(data);
            charData.value = data;
            console.log('Character data retrieved:', charData.value);
            sendCharData();
        } catch (error) {
            console.error('Failed to fetch character data:', error);
        }
    }

    // Optionally, call it when component mounts
    onMounted(() => {
    fetchCharData();
    });
</script>
