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
                        <textarea v-model="store.character_state['text.personality']" placeholder="Personality" rows="4" cols="23"></textarea>
                    </v-col>
                    <v-col>
                        <!-- Bonds -->
                        <textarea v-model="store.character_state['text.bonds']" placeholder="Bonds"  rows="4" cols="23"></textarea>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <!-- Ideals -->
                        <textarea v-model="store.character_state['text.ideals']" placeholder="Ideals"  rows="4" cols="23"></textarea>
                    </v-col>
                    <v-col>
                        <!-- Flaws -->
                        <textarea v-model="store.character_state['text.flaws']" placeholder="Flaws" rows="4" cols="23"></textarea>
                    </v-col>
                
                </v-row>
            </v-col>
            <v-col>
                    <!-- Backstory -->
                    <textarea v-model="store.character_state.backstory" placeholder="Backstory" rows="10" cols="25"></textarea>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                        // pinia store for character creation
    const bullet_points = [
        {text: "Enter the following information for describing your character's personality"},
    ]
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