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
                    <v-select
                        v-model="store.character_state.selected_level"
                        :items="Object.keys(levels)"
                        label="Level"
                    ></v-select>
                </v-col>
                <v-col>
                    <v-select
                        :items="spells.filter(n => n.level === levels[store.character_state.selected_level])"
                        item-title="name"
                        label="Level"
                    ></v-select>
                </v-col>
            </v-row>
        </v-form>
    </v-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
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
</script>

<style>
    p, li {
        font-size: clamp(1rem, calc(1vw + 0.3rem), 3rem);
    }

    .v-select .v-field-label, .v-select .v-field__input, .v-text-field .v-field__input {
        font-size: clamp(1rem, calc(1vw + 0.1rem), 3rem);
    }
</style>