<template>
    <v-card width="30vw">
        <v-col>
            <v-card-title>Step 2: Character Origin</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
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
    </v-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import axios from 'axios'
    const selected_race = ref(null)       // currently selected race
    const races = ref([])                 // array of all races
    const selected_alignment = ref(null)  // currently selected alignment
    const alignments = ref([              // array of all alignments
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
    const selected_background = ref(null) // currently selected background
    const backgrounds = ref([])           // array of all backgrounds

    /**
     * Populate the races array with the fetched race data for use in the v-select menu
     * @param race_data the fetched race data
     */
    function setRaces(race_data) {
        for(let i = 0; i < race_data.length; i++) {
            races.value.push(race_data[i].name)
        }
    }

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
     * Fetch relevant race data from the backend API
     */
    async function fetchRaceData() {
        try {
            const response = await axios.get('http://localhost:5262/api/srd/races')
            //console.log(response.data)
            setRaces(response.data)
        } catch (error) {
            console.error("Failed to fetch race data: ", error)
        }
    }

    /**
     * Fetch relevant alignment data from a third-party API
     */
    async function fetchBackgroundData() {
        try {
            const response = await axios.get('https://api.open5e.com/v2/backgrounds/')
            //console.log(response.data)
            setBackgrounds(response.data)
        } catch (error) {
            console.error("Failed to fetch background data: ", error)
        }
    }

    /**
     * Call fetchRaceDace() on page mount
     */
    onMounted(() => {
        fetchRaceData()
        fetchBackgroundData()
    })
</script>

<style>
</style>