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
                        <v-textarea rows="3" v-model="store.character_state['text.personality']" label="Personality" clearable></v-textarea>
                    </v-col>
                    <v-col>
                        <!-- Bonds -->
                        <v-textarea rows="3" v-model="store.character_state['text.bonds']" label="Bonds" clearable></v-textarea>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <!-- Ideals -->
                        <v-textarea rows="3" v-model="store.character_state['text.ideals']" label="Ideals" clearable></v-textarea>
                    </v-col>
                    <v-col>
                        <!-- Flaws -->
                        <v-textarea rows="3" v-model="store.character_state['text.flaws']" label="Flaws" clearable></v-textarea>
                    </v-col>
                
                </v-row>
            </v-col>
            <v-col>
                    <!-- Backstory -->
                    <v-textarea class="mr-6" rows="8" v-model="store.character_state.backstory" label="Backstory" clearable></v-textarea>
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
</style>