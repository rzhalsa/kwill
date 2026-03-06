<template>
    <div class="center-login">
        <v-card rounded="lg" class="gradient-card">
            <!-- Login Menu -->
            <v-row>
                <!-- Logo and Title + Subtitle -->
                <v-col class="ml-1 mr-16 text-center">
                    <img class="mt-2" src="../assets/icon2-small-margin.png" style="height:130px; width: 200px;" />
                    <v-card-title class="text-h3 text-white">Sign in</v-card-title>
                    <v-card-subtitle class="text-subtitle-1 text-white">to continue to Kwill</v-card-subtitle>
                </v-col>
                <!-- Login fields -->
                <v-col style="width: 20vw">
                    <v-col>
                        <!--Email Field -->
                        <p class="mt-16 mx-12 text-body-1">
                            <input type="text" required placeholder="Email" v-model="email" class="login-input px-2 py-2" style="border-radius: 12px;">
                        </p>
                        <!-- Password Field -->
                        <p class="my-5 mx-12 text-body-1">
                            <input type="password" required placeholder="Password" v-model="password" class="login-input px-2 py-2" style="border-radius: 12px;">
                        </p>
                    </v-col>    
                    <v-row class="ma-1" justify="end">
                        <!-- Create Account Button -->
                        <v-btn variant="text" class="my-4 text-white text-button">Create account</v-btn>
                        <!-- Login Button-->
                        <v-btn large @click="login" color="secondary" class="ma-4 text-button">Sign in</v-btn>
                    </v-row>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { onMounted } from 'vue'
    import { onBeforeUnmount } from 'vue';
    import { useNavbarStore } from '../stores/navbar_state';
    import { useRouter } from 'vue-router'
    const emit = defineEmits(['update:toggle'])
    const email = ref('')
    const password = ref('')
    const store = useNavbarStore()
    const router = useRouter()

    // Call toggleNavBar() in the navbar pinia store 
    const toggleNavbar = () => {
        store.toggleNavbar()
    }

    /* Activates upon the login button being clicked. Currently will log the user in if the default email
     * and password match. Otherwise shows an alert dialog box informing the user they entered invalid
     * credentials.
     */
    function login() {
        // Check if the entered email and password are valid. This will be changed to a database query match
        // later on
        if(email.value == "admin@kwill.com" && password.value == "12345") {
            router.push('/')
        } else {
            alert('Invalid credentials')
        }
    }

    // Handle the keydown event, try to login in if the user pressed 'Enter', return otherwise
    const handleEnter = (event) => {
        if(event.key !== 'Enter') {
            return
        }
        login()
        
    }

    // Logic to execute when the Login page is mounted
    const initialize = () => {
        toggleNavbar()
    }

    // Logic to execute before the logic page in unmounted
    const reloadNavbar = () => {
        toggleNavbar()
    }

    // Called when the login page is mounted
    onMounted(() => {
        initialize()
        window.addEventListener('keydown', handleEnter)
    })

    // Called before the logic page in unmounted
    onBeforeUnmount(() => {
        reloadNavbar()
        window.removeEventListener('keydown', handleEnter)
    })
</script>

<style>
    .center-login {
        display: grid;
        place-items: center;
        height: 75vh;
    }

    .login-input {
        color: black;
        background-color: white;
        width: 12vw;
    }
</style>