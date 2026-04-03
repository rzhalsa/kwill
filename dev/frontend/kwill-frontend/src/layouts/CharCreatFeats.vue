<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 6/8: Feats</v-card-title>
            <v-divider horizontal class="mt-2 mb-3"></v-divider>
            <v-col>
                <v-btn color="primary" @click="addFeatSlot" class="ml-10 mr-10">Add Feat</v-btn>
                <v-btn color="secondary" @click="removeFeatSlot">Remove Feat</v-btn>
                <!-- Feats -->
                <div class="feat-area mt-5">
                    <v-select
                    v-for="index in feat_amt"
                    :key="index"
                    v-model="selected_feats[index]"
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
    const store = useCharacterCreationStore()                           // pinia store for character creation
    const feats = ref([])                                               // array of all feats
    const selected_feats = ref(store.getCharacterState.get('features')) // array of selected feats
    const feat_amt = ref(store.getCharacterState.get('feat_amt'))       // amount of feats the character has

    /**
     * Saves currently entered feat data before the page unmounts
     */
    function saveFeatData() {
        store.setCharacterState('feat_amt', feat_amt)
        store.setCharacterState('features', selected_feats)
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
    .feat-area {
        height: 500px;
        min-height: 0;     
        overflow: auto; 
        border: 1px solid #ddd;
        padding: 8px;
    }
</style>