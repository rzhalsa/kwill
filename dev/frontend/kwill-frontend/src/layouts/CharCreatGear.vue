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
                    v-for="index in gear_amt"
                    v-model="selected_gear[index]"
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
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    const store = useCharacterCreationStore()                           // pinia store for character creation
    const gear = ref([])                                                // array of all gear
    const selected_gear = ref(store.getCharacterState.get('equipment')) // array of selected gear
    const gear_amt = ref(store.getCharacterState.get('gear_amt'))       // amount of gear the character has

    /**
     * Saves currently entered feat data before the page unmounts
     */
    function saveGearData() {
        store.setCharacterState('gear_amt', gear_amt)
        store.setCharacterState('equipment', selected_gear)
    }

    /**
     * Adds an additional gear slot
     */
    function addFeatSlot() {
        gear_amt.value++
    }

    /**
     * Removes a gear slot
     */
    function removeFeatSlot() {
        if(gear_amt.value > 0)
            gear_amt.value--
    }

    /**
     * Fetches feat data and populates the feats var with the fetched data
     * on page mount
     */
    onMounted(async () => {
        const feat_data = await fetchApiData('api/srd/equipment')
        setCharCreateArrayData(gear, feat_data)
    })

    /**
     * Calls saveGearData() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveGearData()
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