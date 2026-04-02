<template>
    <v-card width="40vw" height="50vh">
        <v-row>
            <v-card-title class="mt-3 ml-3">Confirmation and Creation</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>
                <p>You've reached the end of the character creation process! You may click the button below to create your character.</p>
                <v-btn @click="create">Create Character</v-btn>
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