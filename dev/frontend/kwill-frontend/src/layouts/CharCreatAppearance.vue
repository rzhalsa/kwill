<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 7/8: Character Appearance</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col class="ma-3">
                <!-- Age and Eyes -->
                <v-row>
                    <v-col>
                        <v-text-field v-model="age" rounded="pill" variant="outlined" placeholder="Age" density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="eyes" rounded="pill" variant="outlined" placeholder="Eye Color" density="compact"></v-text-field>
                    </v-col>
                </v-row>  
                <!-- Height and Hair -->    
                <v-row>
                    <v-col>
                        <v-text-field v-model="height" rounded="pill" variant="outlined" placeholder="Height" density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="hair" rounded="pill" variant="outlined" placeholder="Hair Color" density="compact"></v-text-field>
                    </v-col>
                </v-row>
                <!-- Weight and Skin -->
                <v-row>
                    <v-col>
                        <v-text-field v-model="weight" rounded="pill" variant="outlined" placeholder="Weight" density="compact"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="skin" rounded="pill" variant="outlined" placeholder="Skin Color" density="compact"></v-text-field>
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
    import { ref, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                 // pinia store for character creation
    const age = ref(store.getCharacterState.get('age'))       // currently entered age
    const height = ref(store.getCharacterState.get('height')) // currently entered height
    const weight = ref(store.getCharacterState.get('weight')) // currently entered weight
    const eyes = ref(store.getCharacterState.get('eyes'))     // currently entered eyes
    const hair = ref(store.getCharacterState.get('hair'))     // currently entered hair
    const skin = ref(store.getCharacterState.get('skin'))     // currently entered eyes
    const bullet_points = [
        {text: "Enter the following information for describing your character's appearance"},
    ]

    /**
     * Saves currently selected appearance data before the page unmounts
     */
    function saveAppearanceData() {
        store.setCharacterState('age', age)
        store.setCharacterState('height', height)
        store.setCharacterState('weight', weight)
        store.setCharacterState('eyes', eyes)
        store.setCharacterState('hair', hair)
        store.setCharacterState('skin', skin)
    }

    /**
     * Calls saveAppearanceData() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveAppearanceData()
    })
</script>

<style>
</style>