<template>
    <v-card width="30vw">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 3: Ability Scores</v-card-title>
            <v-divider horizontal class="mt-2 mb-2"></v-divider>
            <v-col cols="6">    
                <v-select
                    v-model="str"
                    :items="valid_ability_scores"
                    label="Strength"
                    class="ma-4"
                ></v-select>
                <v-select
                    v-model="dex"
                    :items="valid_ability_scores"
                    label="Dexterity"
                    class="ma-4"
                ></v-select>
                <v-select
                    v-model="con"
                    :items="valid_ability_scores"
                    label="Constitution"
                    class="ma-4"
                ></v-select>
            </v-col>
            <v-col cols="6">
                <v-select
                    v-model="wis"
                    :items="valid_ability_scores"
                    label="Wisdom"
                    class="ma-4"
                ></v-select>
                <v-select
                    v-model="int"
                    :items="valid_ability_scores"
                    label="Intelligence"
                    class="ma-4"
                ></v-select>
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
    import { ref, onMounted } from 'vue'
    import axios from 'axios'
    const valid_ability_scores = ref(Array.from({length: 20}, (_, i) => 1 + i)) // valid is 1 to 30
    const str = ref(null)
    const dex = ref(null)
    const con = ref(null)
    const wis = ref(null)
    const int = ref(null)
    const cha = ref(null)
</script>

<style>
</style>