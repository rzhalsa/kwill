<template>
    <v-card width="40vw" height="50vh">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 8/8: Personal Information</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col md="8">
                <v-col>
                    <!-- Personality -->
                    <textarea v-model="personality" placeholder="Personality" class="mr-2 mb-2" rows="3" cols="23"></textarea>
                    <!-- Ideals -->
                    <textarea v-model="ideals" placeholder="Ideals" class="ml-2 mb-2" rows="3" cols="23"></textarea>
                </v-col>
                <v-col>
                    <!-- Bonds -->
                    <textarea v-model="bonds" placeholder="Bonds" class="mr-2 mt-2" rows="3" cols="23"></textarea>
                    <!-- Flaws -->
                    <textarea v-model="flaws" placeholder="Flaws" class="ml-2 mt-2" rows="3" cols="23"></textarea>
                </v-col>   
            </v-col>
            <v-col sm="4" class="d-flex justify-end ">
                <!-- Backstory -->
                <textarea v-model="backstory" placeholder="Backstory" class="ma-3" rows="6" cols="25"></textarea>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                        // pinia store for character creation
    const personality = ref(store.getCharacterState.get('text.personality'))
    const ideals = ref(store.getCharacterState.get('text.ideals'))
    const bonds = ref(store.getCharacterState.get('text.bonds'))
    const flaws = ref(store.getCharacterState.get('text.flaws'))
    const backstory = ref(store.getCharacterState.get('backstory'))

    /**
     * Saves currently entered feat data before the page unmounts
     */
    function savePersonalCharacterData() {
        store.setCharacterState('text.personality', personality)
        store.setCharacterState('text.ideals', ideals)
        store.setCharacterState('text.bonds', bonds)
        store.setCharacterState('text.flaws', flaws)
        store.setCharacterState('backstory', backstory)
    }

    /**
     * Calls savePersonalCharacterData() before the page unmounts
     */
    onBeforeUnmount(() => {
        savePersonalCharacterData()
    })
</script>

<style>
    .login-input {
        color: black;
        background-color: white;
        width: 20vw;
    }

    textarea {
        font-size: larger;
        border-radius: 25px;
        outline-style: solid;
        outline-color: black;
        padding: 3%;
    }
</style>