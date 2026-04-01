<template class="gradient-card">
    <v-card class="gradient-topcard">
        <div class="center-page">
            <h1>Create a Character</h1>
            <v-card rounded="lg" class="gradient-character-creator">
                <v-row>
                    <v-col>
                        <v-btn class="ma-3" icon="mdi-arrow-left" @click="moveBackwards"></v-btn>
                    </v-col>
                </v-row>
                <!-- Current layout for character creation -->
                <v-row class="ma-8">
                    <component v-if="ready" :is="currentLayout" />
                </v-row>
                <v-row>
                    <v-col class="d-flex justify-end mr-2 mb-2">
                        <v-btn icon="mdi-arrow-right" @click="moveForward"></v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </div>
    </v-card>
</template>

<script setup>
    import { ref, shallowRef, onMounted } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state';
    import CharCreatClass from '../layouts/CharCreatClass.vue';                     // character class
    import CharCreatOrigin from '../layouts/CharCreatOrigin.vue';                   // character race, background, languages, and alignment
    import CharCreatAbilityScores from '../layouts/CharCreatAbilityScores.vue';     // character stats
    import CharCreatAppearance from '../layouts/CharCreatAppearance.vue';           // character appearance
    import { createCharacter } from '../models/characterModel';
    const currentLayout = shallowRef(CharCreatClass)                                // start at CharCreatClass layout
    const store = useCharacterCreationStore()                                       // pinia store for character creation
    const ready = ref(false)                                                        // flag for showing the layout once ready
    const character = createCharacter()
    //console.log(character)

    // Maps and count var to track layout order
    let order_count = 0
    const order = new Map([
        [0, CharCreatOrigin],
        [1, CharCreatAbilityScores],
        [2, CharCreatAppearance]
    ])
    const rev_order = new Map([
        [3, CharCreatAbilityScores],
        [2, CharCreatOrigin],
        [1, CharCreatClass]
    ])

    /**
     * Move forward a page
     */
    function moveForward() {
        if(order.has(order_count)) {
            currentLayout.value = order.get(order_count)
            order_count++
            //console.log(order_count)
        }
    }

    /**
     * Move backwards a page
     */
    function moveBackwards() {
        if(rev_order.has(order_count)) {
            currentLayout.value = rev_order.get(order_count)
            order_count--
            //console.log(order_count)
        }
    }

    /**
     * Re-render page on mount
     */
    onMounted(() => {
        store.resetStore()
        ready.value = true
    })
</script>

<style>
    .center-page {
        place-items: center;
        height: 100vh;
    }
</style>