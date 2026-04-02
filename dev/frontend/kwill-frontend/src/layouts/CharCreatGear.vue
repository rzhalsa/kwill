<template>
    <v-card width="40vw" height="50vh">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 5/8: Gear</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>
                <v-btn @click="addFeatSlot">Add Gear</v-btn>
                <v-btn @click="removeFeatSlot">Remove Gear</v-btn>
                <!-- Feats -->
                <div class="feat-area">
                    <v-select
                    v-for="index in gear_amt"
                    v-model="selected_gear[gear_amt]"
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
    const store = useCharacterCreationStore()                        // pinia store for character creation
    const gear = ref([])                                             // array of all gear
    const selected_gear = ref([])                                    // array of selected gear
    const gear_amt = ref(store.getCharacterState.get('gear_amt'))

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
        if(gear_amt.value > 1)
            gear_amt.value--
    }

    /**
     * Fetches feat data and populates the feats var with the fetched data
     * on page mount
     */
    onMounted(async () => {
        const feat_data = await fetchApiData('api/srd/features')
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
    .login-input {
        color: black;
        background-color: white;
        width: 20vw;
    }

    .feat-area {
        height: 300px;        /* or max-height: 300px; */
        overflow: auto;       /* shows scrollbar when content overflows */
        -webkit-overflow-scrolling: touch; /* smooth scrolling on iOS */
        border: 1px solid #ddd;
        padding: 8px;
 
    }
</style>