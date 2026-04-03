<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 8/8: Personal Information</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <!-- Bullet point -->
            <v-row>
                <v-col class="ml-16">
                    <ul>
                        <li class="mb-2" v-for="point in bullet_points" :key="point">{{ point.text }}</li>
                    </ul>
                </v-col>
            </v-row>
        </v-row>
        <!-- Personality textarea components -->
        <v-row class="ml-16">
            <v-col>
                <v-row>
                    <v-col>
                        <!-- Personality -->
                        <textarea v-model="personality" placeholder="Personality" rows="4" cols="23"></textarea>
                    </v-col>
                    <v-col>
                        <!-- Bonds -->
                        <textarea v-model="bonds" placeholder="Bonds"  rows="4" cols="23"></textarea>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <!-- Ideals -->
                        <textarea v-model="ideals" placeholder="Ideals"  rows="4" cols="23"></textarea>
                    </v-col>
                    <v-col>
                        <!-- Flaws -->
                        <textarea v-model="flaws" placeholder="Flaws" rows="4" cols="23"></textarea>
                    </v-col>
                
                </v-row>
            </v-col>
            <v-col>
                    <!-- Backstory -->
                    <textarea v-model="backstory" placeholder="Backstory" rows="10" cols="25"></textarea>
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
    const bullet_points = [
        {text: "Enter the following information for describing your character's personality"},
    ]

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
        font-size: xx-large;
        border-radius: 25px;
        outline-style: solid;
        outline-color: black;
        padding: 3%;
    }
</style>