<template>
    <v-card width="40vw" height="50vh">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 2/8: Character Origin</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>  
                <!-- Race dropdown -->
                <v-select
                    v-model="selected_race"
                    :items="races"
                    label="Race"
                    class="ma-4"
                ></v-select>
                <!-- Alignment dropdown -->
                <v-select
                    v-model="selected_alignment"
                    :items="alignments"
                    label="Alignment"
                    class="ma-4"
                ></v-select>
                <!-- Background dropdown -->
                <v-select
                    v-model="selected_background"
                    :items="backgrounds"
                    label="Background"
                    class="ma-4"
                ></v-select>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import axios from 'axios'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    const store = useCharacterCreationStore()                                  // pinia store for character creation
    const selected_race = ref(store.getCharacterState.get('race'))             // currently selected race
    const races = ref([])                                                      // array of all races
    const selected_alignment = ref(store.getCharacterState.get('alignment'))   // currently selected alignment
    const alignments = ref([                                                   // array of all alignments
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
    const selected_background = ref(store.getCharacterState.get('background')) // currently selected background
    const backgrounds = ref([])                                                // array of all backgrounds

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
     * Saves currently selected origin data before the page unmounts
     */
    function saveOriginData() {
        store.setCharacterState('race', selected_race)
        store.setCharacterState('alignment', selected_alignment)
        store.setCharacterState('background', selected_background)
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

    /**
     * Calls saveOriginData() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveOriginData()
    })
</script>

<style>
</style>