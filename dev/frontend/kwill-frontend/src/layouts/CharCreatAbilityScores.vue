<template>
    <v-card width="30vw">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 3: Ability Scores</v-card-title>
            <v-divider horizontal class="mt-2 mb-2"></v-divider>
            <v-col cols="6">    
                <!-- Strength -->
                <v-select
                    v-model="str"
                    :items="valid_ability_scores"
                    label="Strength"
                    class="ma-4"
                ></v-select>
                <!-- Dexterity -->
                <v-select
                    v-model="dex"
                    :items="valid_ability_scores"
                    label="Dexterity"
                    class="ma-4"
                ></v-select>
                <!-- Constitution -->
                <v-select
                    v-model="con"
                    :items="valid_ability_scores"
                    label="Constitution"
                    class="ma-4"
                ></v-select>
            </v-col>
            <v-col cols="6">
                <!-- Wisdom -->
                <v-select
                    v-model="wis"
                    :items="valid_ability_scores"
                    label="Wisdom"
                    class="ma-4"
                ></v-select>
                <!-- Intelligence -->
                <v-select
                    v-model="int"
                    :items="valid_ability_scores"
                    label="Intelligence"
                    class="ma-4"
                ></v-select>
                <!-- Charisma -->
                <v-select
                    v-model="cha"
                    :items="valid_ability_scores"
                    label="Charisma"
                    class="ma-4"
                ></v-select>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import axios from 'axios'
    const store = useCharacterCreationStore()  // pinia store for character creation
    const valid_ability_scores = ref(Array.from({length: 20}, (_, i) => 1 + i)) // valid range is 1 to 20
    const str = ref(store.getStr)  // strength stat
    const dex = ref(store.getDex)  // dexterity stat
    const con = ref(store.getCon)  // constitution stat
    const wis = ref(store.getWis)  // wisdom stat
    const int = ref(store.getInt)  // intelligence stat
    const cha = ref(store.getCha)  // charisma stat

    /**
     * Saves currently selected ability scores before the page unmounts
     */
    function saveAbilityScores() {
        store.setStr(str)
        store.setDex(dex)
        store.setCon(con)
        store.setWis(wis)
        store.setInt(int)
        store.setCha(cha)
    }

    /**
     * Calls saveAbilityScores() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveAbilityScores()
    })
</script>

<style>
</style>