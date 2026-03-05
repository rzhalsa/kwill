<template>
    <div class="center-login">
        <v-card rounded="lg" class="gradient-card">
            <!-- Login Menu -->
            <v-row>
                <!-- Logo and Title + Subtitle -->
                <v-col>
                    <img src="../assets/icon2.png" style="height:16vh; width: 8vw;" />
                    <v-card-title class="text-h4 text-white">Sign in</v-card-title>
                    <v-card-subtitle class="text-white">to continue to Kwill</v-card-subtitle>
                </v-col>
                <!-- Login fields -->
                <v-col class="text-center">
                        <!-- Username Field -->
                        <p class="ma-12 text-h4">
                            <input type="text" required placeholder="Email" v-model="email" class="login-input">
                        </p>
                        <!-- Password Field -->
                        <p class="ma-12 text-h4">
                            <input type="password" required placeholder="Password" v-model="password" class="login-input">
                        </p>
                        <!-- Login Button-->
                        <v-btn large @click="login" color="secondary" class="ma-4">Login</v-btn>
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
            console.log("Logged in!")
            router.push('/')
        } else {
            console.log("Incorrect credentials")
        }
    }

    // Handle the keydown event, try to login in if the user pressed 'Enter'
    const handleEnter = (event) => {
        if(event.key === 'Enter') {
            login()
        }
        
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
    }
</style>