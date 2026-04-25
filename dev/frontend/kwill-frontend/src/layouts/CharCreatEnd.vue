<template>
    <v-card elevation="8">
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title d-flex align-center justify-space-between">
                Confirmation and Creation
                <v-icon class="ml-4" icon="mdi-party-popper"></v-icon>
            </v-card-title>
            <v-divider horizontal class="mb-6"></v-divider>
            <v-col class="d-flex justify-center">
                <h2 class="mr-3 ml-4 mb-2">You've reached the end of the character creation process!</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex justify-center">
                <h2 class="mr-3 ml-4 mb-12">You may click the button below to create your character.</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex justify-center">
                <v-btn size="x-large" color="secondary" @click="create">Create Character</v-btn>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { createNewCharacter } from '../helpers/charCreationHelpers'
    import { createCharacter, toJson } from '../models/characterModel';
    import { useRouter } from 'vue-router'
    const store = useCharacterCreationStore() // pinia store for character creation
    const character = createCharacter()
    const router = useRouter()

    function create() {
        const filled_character = toJson(character, store.getCharacterState)
        createNewCharacter(filled_character, 'user001', 'character004')
        store.allow_leave = true
        router.replace('/characters')
    }
</script>

<style>
    h2 {
        font-size: clamp(1rem, calc(1.25vw + 0.5rem), 3rem);
    }
</style>