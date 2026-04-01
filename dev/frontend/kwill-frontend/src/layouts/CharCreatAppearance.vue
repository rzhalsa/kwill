<template>
    <v-card width="30vw">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 4: Character Appearance</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>    
                <!-- Age -->
                <p class="ma-2">Age
                    <input type="text" v-model="age" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
                <!-- Height -->
                <p class="ma-2">Height
                    <input type="text" v-model="height" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
                <!-- Weight -->
                <p class="ma-2">Weight
                    <input type="text" v-model="weight" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
            </v-col>
            <v-col>
                <!-- Eyes -->
                <p class="ma-2">Eyes
                    <input type="text" v-model="eyes" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
                <!-- Hair -->
                <p class="ma-2">Hair
                    <input type="text" v-model="hair" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
                <!-- Skin -->
                <p class="ma-2">Skin
                    <input type="text" v-model="skin" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
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