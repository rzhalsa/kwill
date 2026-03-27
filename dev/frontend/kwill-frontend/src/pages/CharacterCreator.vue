<template>
    <div class="center-page">
        <v-card rounded="lg" class="gradient-login">
            <v-row>
                <v-btn icon="mdi-arrow-left" @click="moveBackwards"></v-btn>
            </v-row>
            <v-row>
                <component :is="currentLayout" />
            </v-row>
            <v-row>
                <v-btn icon="mdi-arrow-right" @click="moveForward"></v-btn>
            </v-row>
        </v-card>
    </div>
</template>

<script setup>
    import { ref, shallowRef } from 'vue'
    import CharCreatClass from '../layouts/CharCreatClass.vue'; // character class
    import CharCreatOrigin from '../layouts/CharCreatOrigin.vue'; // character race, background, languages, and alignment
    import CharCreatAbilityScores from '../layouts/CharCreatAbilityScores.vue'; // character stats

    const currentLayout = shallowRef(CharCreatClass) // start at CharCreatClass layout

    // Maps and count var to track layout order
    let order_count = 0
    const order = new Map([
        [0, CharCreatOrigin],
        [1, CharCreatAbilityScores]
    ])
    const rev_order = new Map([
        [2, CharCreatOrigin],
        [1, CharCreatClass]
    ])

    // Move forward a page
    const moveForward = () => {
        if(order.has(order_count)) {
            currentLayout.value = order.get(order_count)
            order_count++
            console.log(order_count)
        }
    }

    // Move back a page
    const moveBackwards = () => {
        if(rev_order.has(order_count)) {
            currentLayout.value = rev_order.get(order_count)
            order_count--
            console.log(order_count)
        }
    }

    
</script>

<style>
    .center-page {
        display: grid;
        place-items: center;
        height: 75vh;
    }
</style>