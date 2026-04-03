<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 3/8: Ability Scores</v-card-title>
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
    import { ref, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                                           // pinia store for character creation                                             
    const valid_ability_scores = ref(Array.from({length: 20}, (_, i) => 1 + i))         // valid range is 1 to 20
    const str = ref(store.getCharacterState.get('ability.strength.modifier.score'))     // strength stat
    const dex = ref(store.getCharacterState.get('ability.dexterity.modifier.score'))    // dexterity stat
    const con = ref(store.getCharacterState.get('ability.constitution.modifier.score')) // constitution stat
    const wis = ref(store.getCharacterState.get('ability.wisdom.modifier.score'))       // wisdom stat
    const int = ref(store.getCharacterState.get('ability.intelligence.modifier.score')) // intelligence stat
    const cha = ref(store.getCharacterState.get('ability.charisma.modifier.score'))     // charisma stat

    /**
     * Saves currently selected ability scores before the page unmounts
     */
    function saveAbilityScores() {
        store.setCharacterState('ability.strength.modifier.score', str)
        store.setCharacterState('ability.dexterity.modifier.score', dex)
        store.setCharacterState('ability.constitution.modifier.score', con)
        store.setCharacterState('ability.wisdom.modifier.score', wis)
        store.setCharacterState('ability.intelligence.modifier.score', int)
        store.setCharacterState('ability.charisma.modifier.score', cha)
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