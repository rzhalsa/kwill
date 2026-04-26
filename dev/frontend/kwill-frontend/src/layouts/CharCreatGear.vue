<template>
    <v-card elevation="8">
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-card-title class="mt-3 ml-3 cc-title d-flex align-center justify-space-between">
                    Step 5/8: Gear
                    <v-icon class="ml-4" icon="mdi-sword"></v-icon>
                </v-card-title>
                <v-divider horizontal class="mb-3"></v-divider>
                <v-col>
                    <v-btn color="primary" @click="addFeatSlot" class="ml-10 mr-10">Add Gear</v-btn>
                    <v-btn color="secondary" @click="removeFeatSlot">Remove Gear</v-btn>
                    <!-- Gear -->
                    <div class="gear-area mt-5">
                        <v-select
                        v-for="(item, index) in store.character_state.gear_amt"
                        v-model="store.character_state.equipment[index]"
                        :items="gear"
                        :rules="[required]"
                        label="Gear"
                        class="ma-4"
                        ></v-select>
                    </div>
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
    const store = useCharacterCreationStore()   // pinia store for character creation
    const form = ref(null)                      // for input validation
    const gear = ref([])                        // array of all gear

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