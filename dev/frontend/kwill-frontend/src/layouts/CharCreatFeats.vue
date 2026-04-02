<template>
    <v-card width="40vw" height="50vh">
        <v-row>
            <v-card-title class="mt-3 ml-3">Step 6/8: Feats</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>
                <v-btn @click="addFeatSlot">Add Feat</v-btn>
                <v-btn @click="removeFeatSlot">Remove Feat</v-btn>
                <!-- Feats -->
                <div class="feat-area">
                    <v-select
                    v-for="index in feat_amt"
                    :items="feats"
                    label="Feats"
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
    const feats = ref([])                                            // array of all feats
    const feat_amt = ref(store.getCharacterState.get('feat_amt'))

    /**
     * Saves currently entered feat data before the page unmounts
     */
    function saveFeatData() {
        store.setCharacterState('feat_amt', feat_amt)
    }

    /**
     * Adds an additional feat slot
     */
    function addFeatSlot() {
        feat_amt.value++
    }

    /**
     * Removes a feat slot
     */
    function removeFeatSlot() {
        if(feat_amt.value > 0)
            feat_amt.value--
    }

    /**
     * Fetches feat data and populates the feats var with the fetched data
     * on page mount
     */
    onMounted(async () => {
        const feat_data = await fetchApiData('api/srd/features')
        setCharCreateArrayData(feats, feat_data)
    })

    /**
     * Calls saveFeatData() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveFeatData()
    })
</script>

<style>
    .login-input {
        color: black;
        background-color: white;
        width: 20vw;
    }

    .feat-area {
        overflow: auto; 
        border: 1px solid #ddd;
        padding: 8px;
 
    }
</style>