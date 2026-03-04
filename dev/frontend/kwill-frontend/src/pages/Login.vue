<template>
    <div class="center-login">
        <!-- Login Menu -->
        <v-row>
            <v-col class="text-center">
                <v-card class="gradient-card ma-1">
                    <v-card-title class="ma-4 text-h1">Login</v-card-title>
                    <!-- Username Field -->
                    <p class="ma-12 text-h4">
                        <input type="text" required placeholder="Email" v-model="email" class="login-input">
                    </p>
                    <!-- Password Field -->
                    <p class="ma-12 text-h4">
                        <input type="password" required placeholder="Password" v-model="password" class="login-input">
                    </p>
                    <!-- Login Button-->
                    <v-btn @click="login" color="secondary" class="ma-4">Login</v-btn>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    const email = ref('')
    const password = ref('')

    /* Activates upon the login button being clicked. Currently will log the user in if the default email
     * and password match. Otherwise shows an alert dialog box informing the user they entered invalid
     * credentials.
     */
    function login() {
        // Check if the entered email and password are valid. This will be changed to a database query match
        // later on
        if(email.value == "admin@kwill.com" && password.value == "12345") {
            console.log("Logged in!")
        } else {
            console.log("Incorrect credentials")
        }
    }
</script>

<style>
    .center-login {
        display: grid;
        justify-content: center;
        place-items: center;
        height: 75vh;
    }

    .login-input {
        color: white;
        background-color: black;
    }
</style>