<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 5/8: Gear</v-card-title>
            <v-divider horizontal class="mt-2 mb-3"></v-divider>
            <v-col>
                <v-btn color="primary" @click="addFeatSlot" class="ml-10 mr-10">Add Gear</v-btn>
                <v-btn color="secondary" @click="removeFeatSlot">Remove Gear</v-btn>
                <!-- Gear -->
                <div class="gear-area mt-5">
                    <v-select
                    v-for="(item, index) in store.character_state.gear_amt"
                    v-model="store.character_state.equipment[index]"
                    :items="gear"
                    label="Gear"
                    class="ma-4"
                    >
                    </v-select>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, defineExpose } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    defineExpose({ canSwap })
    const store = useCharacterCreationStore()                           // pinia store for character creation
    const gear = ref([])                                                // array of all gear

    /**
     * Whether this layout can be swapped forward or not in CharacterCreator.vue
     * 
     * A layout can be swapped once all required fields have been filled out
     */
    async function canSwap() {
        const keys = [
            store.character_state.equipment
        ]

        // Loop for each key in keys to check if they have a value
        for(const key of keys) {
            if(!key) { 
                alert("Please enter all values")
                return false
            }
        }
        return true
    }

    /**
     * Adds an additional gear slot
     */
    function addFeatSlot() {
        store.character_state.gear_amt++
    }

    /**
     * Removes a gear slot
     */
    function removeFeatSlot() {
        if(store.character_state.gear_amt > 0)
            store.character_state.gear_amt--
    }

    /**
     * Fetches feat data and populates the feats var with the fetched data
     * on page mount
     */
    onMounted(async () => {
        const feat_data = await fetchApiData('api/srd/equipment')
        setCharCreateArrayData(gear, feat_data)
    })
</script>

<style>
    .gear-area {
        height: 500px;  
        overflow: auto;     
        border: 1px solid #ddd;
        padding: 8px;
    }
</style>