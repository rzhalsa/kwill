<template>
    <v-card elevation="8">
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-card-title class="mt-3 ml-3 cc-title d-flex align-center justify-space-between">
                    Step 9/9: Personal Information
                    <v-icon class="ml-4" icon="mdi-human-greeting"></v-icon>
                </v-card-title>
                <v-divider horizontal class="mb-6"></v-divider>
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
                            <v-tooltip text="Your character's personality">
                                <template v-slot:activator="{ props }">
                                    <v-textarea rows="3" :rules="[required]" v-bind="props" v-model="store.character_state['text.personality']" label="Personality" no-resize clearable></v-textarea>
                                </template>
                            </v-tooltip>
                        </v-col>
                        <v-col>
                            <!-- Bonds -->
                            <v-tooltip text="Strong connections your character has to people, places, or things">
                                <template v-slot:activator="{ props }">
                                    <v-textarea rows="3" :rules="[required]" v-bind="props" v-model="store.character_state['text.bonds']" label="Bonds" no-resize clearable></v-textarea>
                                </template>
                            </v-tooltip>
                            
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <!-- Ideals -->
                            <v-tooltip text="Your character's core values and beliefs">
                                <template v-slot:activator="{ props }">
                                    <v-textarea rows="3" :rules="[required]" v-bind="props" v-model="store.character_state['text.ideals']" label="Ideals" no-resize clearable></v-textarea>
                                </template>
                            </v-tooltip>           
                        </v-col>
                        <v-col>
                            <!-- Flaws -->
                            <v-tooltip text="Weaknesses or negative traits your character has">
                                <template v-slot:activator="{ props }">
                                    <v-textarea rows="3" :rules="[required]" v-bind="props" v-model="store.character_state['text.flaws']" label="Flaws" no-resize clearable></v-textarea>
                                </template>
                            </v-tooltip> 
                            
                        </v-col>
                    </v-row>
                </v-col>
                <v-col>
                    <!-- Backstory -->
                    <v-tooltip text="Your character's backstory before this adventure">
                        <template v-slot:activator="{ props }">
                            <v-textarea class="mr-6" :rules="[required]" rows="8" v-bind="props" v-model="store.character_state.backstory" label="Backstory" no-resize clearable></v-textarea>
                        </template>
                    </v-tooltip>    
                </v-col>
            </v-row>
        </v-form>   
    </v-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { required } from '../helpers/requiredField'
    defineExpose({ validate })
    const store = useCharacterCreationStore()   // pinia store for character creation
    const form = ref(null)                      // for input validation
    const bullet_points = [
        {text: "Enter the following information for describing your character's personality"},
    ]

    /**
     * Validates that the user has entered all required information on this page
     */
    async function validate() {
        return form.value?.validate()
    }
</script>

<style>
</style>