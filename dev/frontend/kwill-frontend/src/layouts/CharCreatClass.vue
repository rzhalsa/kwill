<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 1/8: Class and Names</v-card-title>
            <v-divider horizontal class="mt-2"></v-divider>
            <v-col class="mr-4">
                <v-row class="ml-2">
                    <v-col>
                        <p>Character Name:</p>
                    </v-col>
                    <v-col class="mr-14">
                        <v-text-field v-model="store.character_state.name" rounded="pill" variant="outlined" density="compact"></v-text-field>
                    </v-col>
                </v-row>
                <v-row class="ml-2">
                    <v-col>
                        <p>Player Name:</p>
                    </v-col>
                    <v-col class="mr-14">
                        <v-text-field v-model="store.character_state.player" rounded="pill" variant="outlined" density="compact"></v-text-field>
                    </v-col>
                </v-row>
                <!-- Class dropdown -->
                <v-select
                    v-model="store.character_state.class"
                    :items="classes"
                    label="Class"
                    class="ml-4 mr-12"
                ></v-select>
                <!-- Class level -->
                 <v-select
                    v-model="store.character_state.level"
                    :items="levels"
                    label="Level"
                    class="ml-4 mr-12"            
                 ></v-select>
            </v-col>
            <v-col class="ml-4">
                <ul>
                    <li class="mb-13" v-for="point in bullet_points" :key="point">{{ point.text }}</li>
                </ul>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    const store = useCharacterCreationStore()                        // pinia store for character creation
    const classes = ref([])                                          // array of all classes
    const levels = ref(Array.from({length: 20}, (_, i) => 1 + i))    // valid levels are 1 to 20
    const bullet_points = [
        {text: "Enter your character's name"},
        {text: "Enter your name"},
        {text: "Choose your character's class"},
        {text: "Select your character's level"}
    ]
    
    /**
     * Fetch character data and populates the classes var with fetched data
     * on page mount
     */
    onMounted(async () => {
        const character_data = await fetchApiData('api/srd/classes')
        setCharCreateArrayData(classes, character_data)
    })
</script>

<style>
    p, li {
        font-size: clamp(1rem, calc(1vw + 0.3rem), 3rem);
    }

    .v-select .v-field-label, .v-select .v-field__input, .v-text-field .v-field__input {
        font-size: clamp(1rem, calc(1vw + 0.1rem), 3rem);
    }
</style>