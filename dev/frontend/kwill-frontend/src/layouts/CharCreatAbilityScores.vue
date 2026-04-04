<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 3/8: Ability Scores</v-card-title>
            <v-divider horizontal></v-divider>
            <v-col>
                <div class="ability-grid ml-2">
                    <!-- Ability score radio buttons -->
                    <div v-for="(slot, slotIndex) in 6" :key="slotIndex">
                        <div>{{ labels[slotIndex] }}</div>
                        <v-radio-group v-model="selections[slotIndex]">
                            <v-radio
                                v-for="(score, i) in ability_scores"
                                :key="i"
                                :label="score.toString()"
                                :value="i"
                                color="primary"
                                :disabled="selections.includes(i) && selections[slotIndex] !== i"
                            ></v-radio>
                        </v-radio-group>
                    </div>
                </div>
                <!-- Button to reset radio buttons -->
                <v-btn class="ml-3" color="primary" @click="resetSelections">Reset</v-btn>
            </v-col>
            <v-col class="mt-5 ml-4 mr-3">
                <v-row>
                    <!-- Bullet points -->
                    <p>{{ bullet_points[0].text }}</p>
                </v-row>
                <v-row>
                    <v-col>
                        <!-- Standard Array btn -->
                        <v-row class="mt-2 mb-6">
                            <v-tooltip text="Use the following six scores for your abilities: 15, 14, 13, 12, 10, 8.">
                                <template v-slot:activator="{ props }">
                                    <v-btn size="small" color="primary" v-bind="props" @click="determineAbilityScores('standard_array')">Standard Array</v-btn>
                                </template>
                            </v-tooltip>
                        </v-row>
                        <!-- Random Rolls btn-->
                        <v-row class="mb-6">
                            <v-tooltip text="Rolls 4d6 and sums the highest 3 dice. Does this until you have 6 scores.">
                                <template v-slot:activator="{ props }">
                                    <v-btn size="small" color="secondary" v-bind="props" @click="determineAbilityScores('random_rolls')">Random Rolls</v-btn>
                                </template>
                            </v-tooltip>
                        </v-row>
                        <!-- Point Buy btn-->
                        <v-row>
                            <v-tooltip text="You have 27 points to spend on ability scores as you wish.">
                                <template v-slot:activator="{ props }">
                                    <v-btn size="small" color="primary" v-bind="props" @click="determineAbilityScores('point_buy')">Point Buy</v-btn>
                                </template>
                            </v-tooltip>
                        </v-row>
                    </v-col>
                </v-row>        
                <v-row>
                    <v-col>
                        <!-- Area to display scores -->
                        <div v-if="(selected_absc_method === 'standard_array' || selected_absc_method === 'random_rolls')">
                            <p>Your Scores:</p>
                            <div class="score-grid">
                                <p v-for="score in ability_scores"> {{ score }} </p>
                            </div>
                        </div>
                        <div v-else-if="selected_absc_method === 'point_buy'">
                            <p>{{ remaining_points }} points remaining</p>
                            <div class="score-grid">
                                <div v-for="(score, i) in ability_scores" :key="i">
                                    <v-btn rounded="xl" size="x-small" variant="text" @click="pointBuy(i, score - 1)" icon="mdi-minus"></v-btn>
                                    {{ score }}
                                    <v-btn rounded="xl" size="x-small" variant="text"  @click="pointBuy(i, score + 1)" icon="mdi-plus"></v-btn>
                                </div>
                            </div> 
                        </div>
                    </v-col> 
                </v-row>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, computed, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                                             // pinia store for character creation                                             
    const bullet_points = [            
        {text: "Select a method to determine your ability scores:"},
    ]
    const selected_absc_method = ref(store.getCharacterState.get('ability_score_method')) // the selected method to determine ability scores
    const ability_scores = ref(store.getCharacterState.get('character_ability_scores'))   // array of possible ability scores for a character
    const selections = ref(store.getCharacterState.get('selections'))
    const total_points = 27                                                                                         // total amount of points for Point Buy
    const used_points = computed(() => ability_scores.value.reduce((sum, score) => sum + point_buy_cost[score], 0)) // the amount of points already used
    const remaining_points = computed(() => total_points - used_points.value)                                       // the amount of points remaining
    // Maps the cost for each point in point buy
    const point_buy_cost = {
        15: 9,
        14: 7,
        13: 5,
        12: 4,
        11: 3,
        10: 2,
        9: 1,
        8: 0
    }
    // Labels for the ability scores
    const labels = [
        "STR",
        "DEX",
        "CON",
        "WIS",
        "INT",
        "CHA"
    ]

    /**
     * Saves currently selected ability scores and selected method before the page unmounts
     */
    function saveAbilityScores() {
        store.setCharacterState('ability.strength.modifier.score', ability_scores.value[selections.value[0]])
        store.setCharacterState('ability.dexterity.modifier.score', ability_scores.value[selections.value[1]])
        store.setCharacterState('ability.constitution.modifier.score', ability_scores.value[selections.value[2]])
        store.setCharacterState('ability.wisdom.modifier.score', ability_scores.value[selections.value[3]])
        store.setCharacterState('ability.intelligence.modifier.score', ability_scores.value[selections.value[4]])
        store.setCharacterState('ability.charisma.modifier.score', ability_scores.value[selections.value[5]])
        store.setCharacterState('ability_score_method', selected_absc_method)
        store.setCharacterState('character_ability_scores', ability_scores)
    }

    /**
     * Determines the character's ability scores based off the chosen methods
     * @param method the ability score method to be used
     */
    function determineAbilityScores(method) {
        selected_absc_method.value = method
        switch(method) {
            case 'standard_array':
                standardArray()
                break
            case 'random_rolls':
                randomRoll()
                break
            case 'point_buy':
                resetAbilityScores()
                break
        }
    }

    /**
     * Sets ability_scores to reflect the values of a standard array
     */
    function standardArray() {
        ability_scores.value = [15, 14, 13, 12, 10, 8]
    }

    /**
     * Sets ability_scores to reflect the values of 6 random 4d6 drop lowest rolls
     */
    function randomRoll() {
        for(let i = 0; i < 6; i++) {
            ability_scores.value[i] = roll4d6()
        }
    }

    /**
     * Rolls four d6 die and returns the sum of the 3 highest rolls
     */
    function roll4d6() {
        const first = Math.floor((Math.random() * 6) + 1)
        const second = Math.floor((Math.random() * 6) + 1)
        const third = Math.floor((Math.random() * 6) + 1)
        const fourth = Math.floor((Math.random() * 6) + 1)
        const min = Math.min(first, second, third, fourth)
        const sum = (first + second + third + fourth) - min
        return sum
    }

    /**
     * Logic for implementing the Point Buy method
     * @param index the index of the score
     * @param new_score the new ability score
     */
    function pointBuy(index, new_score) {
        // Prevent the player from setting invalid point buy scores
        if(new_score < 8 || new_score > 15) {
            return
        }

        const old_score = ability_scores.value[index]
        const cost_difference = point_buy_cost[new_score] - point_buy_cost[old_score]

        // Prevent the player from spending more points than they are allotted
        if (remaining_points.value - cost_difference < 0) {
            return
        }

        ability_scores.value[index] = new_score
    }

    /**
     * Resets the value of ability_scores for the Point Buy method
     */
    function resetAbilityScores() {
        ability_scores.value = [8, 8, 8, 8, 8, 8]
    }

    /**
     * Resets the value of selections
     */
    function resetSelections() {
        selections.value = []
    }

    /**
     * Calls saveAbilityScores() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveAbilityScores()
    })
</script>

<style>
    .ability-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 16px;
    }

    .score-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    p, li {
        font-size: clamp(0.8rem, calc(1vw + 0.1rem), 2rem);
    }

    .v-radio .v-field-label {
        font-size: 10px;
    }
</style>