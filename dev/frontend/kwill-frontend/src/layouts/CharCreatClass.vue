<template>
    <v-card width="30vw">
        <v-col>
            <v-card-title>Step 1: Class and Names</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <p class="ma-2">Character Name
                <input type="text" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
            </p>
            <p class="ma-2">Player Name
                <input type="text" required class="login-input px-2 py-2 d-flex justify-end" style="border-radius: 15px; border-style: solid; border-color: black;">
            </p>
            <!-- Class dropdown -->
             <v-select
                v-model="selected"
                :items="classes"
                label="Class"
                class="ma-4"
             ></v-select>
        </v-col>
    </v-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import axios from 'axios'
    const selected = ref(null)  // currently selected item in the v-select menu
    const classes = ref([])     // array of all classes

    /**
     * Populate the classes array with the fetched class data for use in the v-select menu
     * @param class_data the fetched class data
     */
    function setClasses(class_data) {
        for(let i = 0; i < class_data.length; i++) {
            classes.value.push(class_data[i].name)
        }
    }

    /**
     * Fetch relevant class data from the backend API
     */
    async function fetchClassData() {
        try {
            const response = await axios.get('http://localhost:5262/api/srd/classes')
            //console.log(response.data)
            setClasses(response.data)
        } catch (error) {
            console.error('Failed to fetch class data: ', error)
        }
    }

    /**
     * Call fetchClassData() on page mount
     */
    onMounted(() => {
        fetchClassData()
    })
</script>

<style>
    .login-input {
        color: black;
        background-color: white;
        width: 20vw;
    }
</style>