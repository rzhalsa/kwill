<template class="gradient-card">
    <v-card class="gradient-topcard">
        <div class="center-page">
            <h1>Create a Character</h1>
            <v-card rounded="lg" class="gradient-character-creator">
                <v-row class="ml-2 mt-2">
                    <!-- Move backwards button -->
                    <v-btn :class="{ hidden: order_count === 0 }" icon="mdi-arrow-left" @click="moveBackwards"></v-btn>
                </v-row>
                <!-- Current layout for character creation -->
                <v-row class="ma-8">
                    <component v-if="ready" class="page-size" :is="currentLayout" />
                </v-row>
                <v-row class="d-flex justify-end mr-2 mb-2">
                    <!-- Move forward button -->
                    <v-btn :class="{ hidden: order_count === 8 }" icon="mdi-arrow-right" @click="moveForward"></v-btn>
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
    import CharCreatSkills from '../layouts/CharCreatSkills.vue';                   // skills and which one the character has proficiency in
    import CharCreatGear from '../layouts/CharCreatGear.vue';                       // gear the character has
    import CharCreatFeats from '../layouts/CharCreatFeats.vue';                     // character feats
    import CharCreatAppearance from '../layouts/CharCreatAppearance.vue';           // character appearance
    import CharCreatPersonal from '../layouts/CharCreatPersonal.vue';               // personal information about character
    import CharCreatEnd from '../layouts/CharCreatEnd.vue';                         // confirmation page at the end
    const currentLayout = shallowRef(CharCreatClass)                                // start at CharCreatClass layout
    const store = useCharacterCreationStore()                                       // pinia store for character creation
    const ready = ref(false)                                                        // flag for showing the layout once ready

    // Maps and count var to track layout order
    const order_count = ref(0)
    const order = new Map([
        [0, CharCreatOrigin],
        [1, CharCreatAbilityScores],
        [2, CharCreatSkills],
        [3, CharCreatGear],
        [4, CharCreatFeats],
        [5, CharCreatAppearance],
        [6, CharCreatPersonal],
        [7, CharCreatEnd]
    ])
    const rev_order = new Map([
        [8, CharCreatPersonal],
        [7, CharCreatAppearance],
        [6, CharCreatFeats],
        [5, CharCreatGear],
        [4, CharCreatSkills],
        [3, CharCreatAbilityScores],
        [2, CharCreatOrigin],
        [1, CharCreatClass]
    ])

    /**
     * Move forward a page
     */
    function moveForward() {
        if(order.has(order_count.value)) {
            currentLayout.value = order.get(order_count.value)
            order_count.value++
            //console.log(order_count)
        }
    }

    /**
     * Move backwards a page
     */
    function moveBackwards() {
        if(rev_order.has(order_count.value)) {
            currentLayout.value = rev_order.get(order_count.value)
            order_count.value--
            //console.log(order_count)
        }
    }

    /**
     * Reset pinia store on mount
     */
    onMounted(() => {
        store.resetStore()
        ready.value = true
    })
</script>

<style>
    .center-page {
        place-items: center;
        height: 100dvh;
    }

    h1 {
        font-size: clamp(1rem, calc(2.5vw + 1rem), 6rem);
        text-decoration: underline;
    }

    .hidden {
        visibility: hidden;
    }

    .page-size {
        width: 50dvw;
        height: 50dvh;
        min-width: 500px;
        max-width: 1200px;
        min-height: 500px;
        max-height: 1000px;
    }
</style>