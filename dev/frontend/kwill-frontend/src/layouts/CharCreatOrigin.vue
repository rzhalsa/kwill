<template>
    <v-card>
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-card-title class="mt-3 ml-3 cc-title">Step 2/8: Character Origin</v-card-title>
                <v-divider horizontal class="mt-2 mb-4"></v-divider>
                <v-col>  
                    <!-- Race dropdown -->
                    <v-select
                        :rules="[required]"
                        v-model="store.character_state.race.name"
                        :items="races"
                        label="Race"
                        class="ml-6 mb-6 mr-6"
                    ></v-select>
                    <!-- Alignment dropdown -->
                     <v-select
                        :rules="[required]"
                        v-model="store.character_state.alignment"
                        :items="alignments"
                        label="Alignment"
                        class="ml-6 mb-6 mr-6"
                    ></v-select>
                    <!-- Background dropdown -->
                    <v-select
                        :rules="[required]"
                        v-model="store.character_state.background.name"
                        :items="backgrounds"
                        label="Background"
                        class="ma-6"
                    ></v-select>
                </v-col>
                <v-col class="ml-4">
                    <ul>
                        <li class="mb-16" v-for="point in bullet_points" :key="point">{{ point.text }}</li>
                    </ul>
                </v-col>
            </v-row>
        </v-form>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount, defineExpose } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import axios from 'axios'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    import { required } from '../helpers/requiredField'
    defineExpose({ validate })
    const store = useCharacterCreationStore()     // pinia store for character creation
    const form = ref(null)                        // for input validation
    const races = ref([])                         // array of all races
    const backgrounds = ref([])                   // array of all backgrounds
    const alignments = ref([                      // array of all alignments
        "Lawful Good",
        "Neutral Good",
        "Chaotic Good",
        "Lawful Neutral",
        "Neutral",
        "Chaotic Neutral",
        "Lawful Evil",
        "Neutral Evil",
        "Chaotic Evil"
    ])   
    const bullet_points = [
        {text: "Select your character's race"},
        {text: "Enter your character's moral alignment"},
        {text: "Choose your character's background"},
    ]      
    

    /**
     * Populate the backgrounds array with the fetched background data for use in the v-select menu
     * @param background_data the fetched background data
     */
    function setBackgrounds(background_data) {
        for(let i = 0; i < background_data.count; i++) {
            // Push all backgrounds while avoiding duplicate entries
            if(!backgrounds.value.includes(background_data.results[i].name)) {
                backgrounds.value.push(background_data.results[i].name)
            }
        }
    }

    /**
     * Fetch relevant alignment data from a third-party API
     */
    async function fetchBackgroundData() {
        try {
            const response = await axios.get('https://api.open5e.com/v2/backgrounds/')
            return response.data
        } catch (error) {
            console.error("Failed to fetch background data: ", error)
        }
    }

    /**
     * Validates that the user has entered all required information on this page
     */
    async function validate() {
        return form.value?.validate()
    }

    /**
     * Fetches race + background data and populate the races + background
     * vars with the fetched data on page mount
     */
    onMounted(async () => {
        const race_data = await fetchApiData('api/srd/races')
        setCharCreateArrayData(races, race_data)
        const background_data = await fetchBackgroundData()
        setBackgrounds(background_data)
    })
</script>

<style>
</style>