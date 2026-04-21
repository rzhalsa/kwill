<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 7/8: Character Appearance</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col class="ma-3">
                <!-- Age and Eyes -->
                <v-row>
                    <v-col>
                        <v-text-field :rules="[required]" v-model="store.character_state.age" rounded="pill" variant="outlined" label="Age" clearable density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field :rules="[required]" v-model="store.character_state.eyes" rounded="pill" variant="outlined" label="Eye Color" clearable density="compact"></v-text-field>
                    </v-col>
                </v-row>  
                <!-- Height and Hair -->    
                <v-row>
                    <v-col>
                        <v-text-field :rules="[required]" v-model="store.character_state.height" rounded="pill" variant="outlined" label="Height" clearable density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field :rules="[required]" v-model="store.character_state.hair" rounded="pill" variant="outlined" label="Hair Color" clearable density="compact"></v-text-field>
                    </v-col>
                </v-row>
                <!-- Weight and Skin -->
                <v-row>
                    <v-col>
                        <v-text-field :rules="[required]" v-model="store.character_state.weight" rounded="pill" variant="outlined" label="Weight" clearable density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field :rules="[required]" v-model="store.character_state.skin" rounded="pill" variant="outlined" label="Skin Color" clearable density="compact"></v-text-field>
                    </v-col>
                </v-row>
            </v-col>
            <v-col class="ml-4 mr-4 mt-4">
                <v-row>
                    <ul>
                        <li class="mb-4" v-for="point in bullet_points" :key="point">{{ point.text }}</li>
                    </ul>
                </v-row>
                <v-row>
                    <v-textarea class="mr-10" :rules="[required]" v-model="store.character_state.appearance" label="Describe your Appearance" clearable></v-textarea>
                </v-row>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, defineExpose } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { required } from '../helpers/requiredField'
    const store = useCharacterCreationStore()                 // pinia store for character creation
    const bullet_points = [
        {text: "Enter the following information for describing your character's appearance"},
    ]
    defineExpose({ canSwap })

    /**
     * Whether this layout can be swapped forward or not in CharacterCreator.vue
     * 
     * A layout can be swapped once all required fields have been filled out
     */
    async function canSwap() {
        const keys = [
            store.character_state.age,
            store.character_state.eyes,
            store.character_state.height,
            store.character_state.hair,
            store.character_state.weight,
            store.character_state.skin,
            store.character_state.appearance
        ]

        // Loop for each key in keys to check if they have a value
        for(const key of keys) {
            if(!key) { 
                return false
            }
        }
        return true
    }
</script>

<style>
</style>