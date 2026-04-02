<template>
    <v-card width="40vw" height="50vh">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 1/8: Class and Names</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>
                <!-- Character Name -->
                <p class="ma-2">Character Name
                    <input type="text" v-model="character_name" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
                <!-- Player Name -->
                <p class="ma-2">Player Name
                    <input type="text" v-model="player_name" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
                </p>
                <!-- Class dropdown -->
                <v-select
                    v-model="selected"
                    :items="classes"
                    label="Class"
                    class="ma-4"
                ></v-select>
                <!-- Class level -->
                 <v-select
                    v-model="level"
                    :items="levels"
                    label="Level"
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
    const store = useCharacterCreationStore()                        // pinia store for character creation
    const character_name = ref(store.getCharacterState.get('name'))  // currently entered character name
    const player_name = ref(store.getCharacterState.get('player'))   // currently entered player name
    const selected = ref(store.getCharacterState.get('class'))       // currently selected item in the v-select menu
    const classes = ref([])                                          // array of all classes
    const level = ref(store.getCharacterState.get('classlevel'))     // class level
    const levels = ref(Array.from({length: 20}, (_, i) => 1 + i))    // valid levels are 1 to 20

    /**
     * Saves currently entered class and name data before the page unmounts
     */
    function saveClassData() {
        store.setCharacterState('name', character_name)
        store.setCharacterState('player', player_name)
        store.setCharacterState('class', selected)
    }

    /**
     * Fetch character data and populates the classes var with fetched data
     * on page mount
     */
    onMounted(async () => {
        const character_data = await fetchApiData('api/srd/classes')
        setCharCreateArrayData(classes, character_data)
    })

    /**
     * Calls saveClassData() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveClassData()
    })
</script>

<style>
    .login-input {
        color: black;
        background-color: white;
        width: 20vw;
    }
</style>