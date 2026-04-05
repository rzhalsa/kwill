<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 7/8: Character Appearance</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col class="ma-3">
                <!-- Age and Eyes -->
                <v-row>
                    <v-col>
                        <v-text-field v-model="store.character_state.age" rounded="pill" variant="outlined" placeholder="Age" density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="store.character_state.eyes" rounded="pill" variant="outlined" placeholder="Eye Color" density="compact"></v-text-field>
                    </v-col>
                </v-row>  
                <!-- Height and Hair -->    
                <v-row>
                    <v-col>
                        <v-text-field v-model="store.character_state.height" rounded="pill" variant="outlined" placeholder="Height" density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="store.character_state.hair" rounded="pill" variant="outlined" placeholder="Hair Color" density="compact"></v-text-field>
                    </v-col>
                </v-row>
                <!-- Weight and Skin -->
                <v-row>
                    <v-col>
                        <v-text-field v-model="store.character_state.weight" rounded="pill" variant="outlined" placeholder="Weight" density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="store.character_state.skin" rounded="pill" variant="outlined" placeholder="Skin Color" density="compact"></v-text-field>
                    </v-col>
                </v-row>
            </v-col>
            <v-col class="ml-4 mr-4">
                <ul>
                    <li class="mb-13" v-for="point in bullet_points" :key="point">{{ point.text }}</li>
                </ul>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                 // pinia store for character creation
    const bullet_points = [
        {text: "Enter the following information for describing your character's appearance"},
    ]
</script>

<style>
</style>