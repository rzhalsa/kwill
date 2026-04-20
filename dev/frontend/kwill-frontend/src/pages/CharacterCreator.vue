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
                    <component v-if="ready" ref="child" class="page-size" :is="currentLayout" />
                </v-row>
                <v-row class="d-flex justify-end mr-2 mb-2">
                    <!-- Move forward button -->
                    <v-btn :class="{ hidden: order_count === 8 }" icon="mdi-arrow-right" @click="moveForward"></v-btn>
                </v-row>
            </v-card>
        </div>
    </v-card>
    <!-- Dialog box that shows if the user tries to leave partway through character creation process -->
    <v-dialog persistent max-width="500" v-model="show_dialog">
        <v-card class="gradient-cc-dialog">
            <v-card-title>Leave Character Creation?</v-card-title>
            <v-card-text>Your progress will be lost.</v-card-text>
            <v-card-actions>
                <v-btn variant="elevated" @click="show_dialog = false">Cancel</v-btn>
                <v-btn variant="elevated" color="error" @click="confirmLeave">Leave</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
    import { ref, shallowRef, onMounted } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state';
    import { onBeforeRouteLeave } from 'vue-router';
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
    const show_dialog = ref(false)                                                  // flag for showing the dialog box
    const pending_nav = ref(null)
    const child = ref(null)

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
    async function moveForward() {
        if(order.has(order_count.value)) {
            const can = child.value?.canSwap ? await child.value.canSwap() : true
            if(can) {
                currentLayout.value = order.get(order_count.value)
                order_count.value++
            }   
        }
    }

    /**
     * Move backwards a page
     */
    function moveBackwards() {
        if(rev_order.has(order_count.value)) {
            currentLayout.value = rev_order.get(order_count.value)
            order_count.value--
        }
    }

    /**
     * Show dialog box confirming the user wants to leave
     */
    onBeforeRouteLeave((to, from, next) => {
        if(!store.allow_leave && store.is_dirty) {
            show_dialog.value = true
            pending_nav.value = next
        } else {
            next()
        }
    })

    function confirmLeave() {
        pending_nav.value()
        pending_nav.value = null
        show_dialog.value = false
    }
    

    /**
     * Reset pinia store on page mount
     */
    onMounted(() => {
        store.resetStore()
        store.$subscribe(() => {
            store.is_dirty = true
        })
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