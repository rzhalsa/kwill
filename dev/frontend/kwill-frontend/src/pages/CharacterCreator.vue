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
                <v-row class="ma-6">
                    <component :is="currentLayout" />
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
    import CharCreatClass from '../layouts/CharCreatClass.vue'; // character class
    import CharCreatOrigin from '../layouts/CharCreatOrigin.vue'; // character race, background, languages, and alignment
    import CharCreatAbilityScores from '../layouts/CharCreatAbilityScores.vue'; // character stats
    import axios from 'axios'

    const currentLayout = shallowRef(CharCreatClass) // start at CharCreatClass layout
    const charData = ref(null)

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

    /*

    async function fetchCharData() {
        try {
            const response = await axios.get(`https://www.dnd5eapi.co/classes`)
            const data = response.data;
            console.log(data);
            charData.value = data;
            console.log('Character data retrieved:', charData.value);
            //sendCharData();
        } catch (error) {
            console.error('Failed to fetch character data:', error);
        }
    }

    // Optionally, call it when component mounts
    onMounted(() => {
        fetchCharData();
    });
    */

</script>

<style>
    .center-page {
        place-items: center;
        height: 75vh;
    }
</style>