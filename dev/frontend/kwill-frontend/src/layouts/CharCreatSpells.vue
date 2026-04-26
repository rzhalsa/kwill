<template>
    <v-card elevation="8">
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-card-title class="mt-3 ml-3 cc-title d-flex align-center justify-space-between">
                    Step 5/9: Spells
                    <v-icon class="ml-4" icon="mdi-magic-staff"></v-icon>
                </v-card-title>
                <v-divider horizontal></v-divider>
                <v-col class="ml-6">
                    <p>Select your spells</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="3" class="ml-4 mr-16">
                    <!-- Selected spell leve dropdown -->
                    <v-select
                        v-model="store.character_state.selected_level"
                        :items="Object.values(levels)"
                        :item-title="Object.keys(levels)"
                        label="Level"
                    ></v-select>
                </v-col>
                <v-col>
                    <v-btn color="primary" @click="addSpell" class="ml-10 mr-10">Add Spell</v-btn>
                    <v-btn color="secondary" @click="removeSpell">Remove Spell</v-btn>
                    <div class="spell-area mt-6 mr-6">
                        <v-select
                            v-for="(item, index) in store.character_state.spell_amt[store.character_state.selected_level]"
                            :key="index"
                            v-model="spellModel(store.character_state.selected_level, index).value"
                            :items="spells.filter(n => n.level === store.character_state.selected_level)"
                            item-title="name"
                            label="Spell"
                            return-object
                        ></v-select>
                    </div>    
                </v-col>
            </v-row>
        </v-form>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, onBeforeMount, computed } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    import { required } from '../helpers/requiredField';
    defineExpose({ validate })
    const form = ref(null)                       // for input validation
    const store = useCharacterCreationStore()    // pinia store for character creation
    const spells = ref([])                       // array of all spells
    const levels = {
        "Cantrips" : 0,
        "1st": 1,
        "2nd": 2,
        "3rd": 3,
        "4th": 4,
        "5th": 5,
        "6th": 6,
        "7th": 7,
        "8th": 8,
        "9th": 9
    }

    /**
     * Trims spells so that only spells selectable by the user's current class are shown
     */
    function trimSpells() {
        const char_class = (store.character_state.classes.firstclass.name).toLowerCase()
        for(let i = 0; i < spells.value.length; i++) {
            if(!((spells.value[i].classes).includes(char_class))) {
                spells.value.splice(i, 1)
                i--
            }
        }
    }

    /**
     * 
     * @param level 
     * @param index 
     */
    function spellModel(level, index) {
        return computed({
            get: () => store.character_state.spells[level][index],
            set: value => {
                store.character_state.spells[level][index] = {
                    ...value,
                    prepared: false,
                }
            }
        })
    }

    /**
     * Adds an additional gear slot
     */
    function addSpell() {
        store.character_state.spell_amt[store.character_state.selected_level]++
    }

    /**
     * Removes a gear slot
     */
    function removeSpell() {
        if(store.character_state.spell_amt[store.character_state.selected_level] > 0)
            store.character_state.spell_amt[store.character_state.selected_level]--
    }

    /**
     * Validates that the user has entered all required information on this page
     */
    async function validate() {
        return form.value?.validate()
    }
    
    /**
     * Fetch spell data and populates the spells var with fetched data
     * and then trims for the user-selected class on page mount
     */
    onMounted(async () => {
        const spell_data = await fetchApiData('api/srd/spells')
        setCharCreateArrayData(spells, spell_data)
        trimSpells()
    })

    onBeforeMount(() => {
        console.log(store.character_state.spells)
    })
</script>

<style>
    p, li {
        font-size: clamp(1rem, calc(1vw + 0.3rem), 3rem);
    }

    .v-select .v-field-label, .v-select .v-field__input, .v-text-field .v-field__input {
        font-size: clamp(1rem, calc(1vw + 0.1rem), 3rem);
    }

    .spell-area {
        height: 300px;  
        overflow: auto;     
        border: 1px solid #ddd;
        padding: 8px;
    }
</style>