<template>
    <v-card elevation="8">
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-card-title class="mt-3 ml-3 cc-title d-flex align-center justify-space-between">
                    Step 6/8: Feats
                    <v-icon class="ml-4" icon="mdi-weight-lifter"></v-icon>
                </v-card-title>
                <v-divider horizontal class="mb-3"></v-divider>
                <v-col>
                    <v-btn color="primary" @click="addFeatSlot" class="ml-10 mr-10">Add Feat</v-btn>
                    <v-btn color="secondary" @click="removeFeatSlot">Remove Feat</v-btn>
                    <!-- Feats -->
                    <div class="feat-area mt-5">
                        <!-- Bug!!! make v-for loop from 0 to store-->
                        <v-select
                        v-for="(item, index) in store.character_state.feat_amt"
                        :key="index"
                        v-model="store.character_state['text.features'][index]"
                        :items="feats"
                        :rules="[required]"
                        label="Feats"
                        class="ma-4"
                        ></v-select>
                    </div>
                </v-col>
            </v-row>
        </v-form>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, defineExpose } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    import { fetchApiData, setCharCreateArrayData } from '../helpers/charCreationHelpers'
    import { required } from '../helpers/requiredField';
    defineExpose({ validate })
    const store = useCharacterCreationStore()   // pinia store for character creation
    const form = ref(null)                      // for input validation
    const feats = ref([])                       // array of all feats

    /**
     * Adds an additional feat slot
     */
    function addFeatSlot() {
        store.character_state.feat_amt++
    }

    /**
     * Removes a feat slot
     */
    function removeFeatSlot() {
        if(store.character_state.feat_amt > 0)
            store.character_state.feat_amt--
    }

    /**
     * Validates that the user has entered all required information on this page
     */
    async function validate() {
        return form.value?.validate()
    }

    /**
     * Fetches feat data and populates the feats var with the fetched data
     * on page mount
     */
    onMounted(async () => {
        const feat_data = await fetchApiData('api/srd/features')
        setCharCreateArrayData(feats, feat_data)
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