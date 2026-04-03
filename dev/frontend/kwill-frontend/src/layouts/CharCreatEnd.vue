<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Confirmation and Creation</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
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
                <v-btn size="x-large" color="primary" @click="create">Create Character</v-btn>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { createNewCharacter } from '../helpers/charCreationHelpers'
    import { createCharacter, toJson } from '../models/characterModel';
    const store = useCharacterCreationStore() // pinia store for character creation
    const character = createCharacter()
    
    function create() {
        const filled_character = toJson(character, store.getCharacterState)
        createNewCharacter(filled_character, 'user001', 'character001')
    }
</script>

<style>
</style>