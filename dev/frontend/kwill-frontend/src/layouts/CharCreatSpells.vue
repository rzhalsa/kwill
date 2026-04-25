<template>
    <v-card elevation="8">
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-card-title class="mt-3 ml-3 cc-title d-flex align-center justify-space-between">
                    Step 5/9: Spells
                    <v-icon class="ml-4" icon="mdi-magic-staff"></v-icon>
                </v-card-title>
                <v-divider horizontal></v-divider>
                <v-col class="mr-4">
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
    const form = ref(null)                                           // for input validation
    const store = useCharacterCreationStore()                        // pinia store for character creation
    const spells = ref([])                                           // array of all spells

    /**
     * Trims spells so that only spells selectable by the user's current class are shown
     */
    function trimSpells() {
        const char_class = (store.character_state.classes.firstclass.name).toLowerCase()
        console.log(char_class)
        for(let i = 0; i < spells.value.length; i++) {
            //console.log(spells.value[i].classes)
            if(!((spells.value[i].classes).includes(char_class))) {
                //console.log("OUT")
                spells.value.splice(i, 1)
                i--
            }
        }

        for(let i = 0; i < spells.value.length; i++) {
            //console.log(spells.value[i].classes)
        }
    }

    /**
     * Validates that the user has entered all required information on this page
     */
    async function validate() {
        return form.value?.validate()
    }
    
    /**
     * Fetch character data and populates the classes var with fetched data
     * on page mount
     */
    onMounted(async () => {
        const spell_data = await fetchApiData('api/srd/spells')
        setCharCreateArrayData(spells, spell_data, false)
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