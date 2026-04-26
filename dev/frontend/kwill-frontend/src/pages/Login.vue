<template>
    <v-snackbar location="top" color="secondary" v-model="loginFail" timeout="1500">
        <div class="d-flex justify-center text-h6">{{errorMessage}}</div>
    </v-snackbar>
    <div class="center-login">
        <v-card rounded="lg" class="gradient-login">
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
                    <v-form v-model="form" @submit.prevent="loginAccount">
                        <v-col>
                            <!--Email Field -->
                            <p class="mt-16 mx-12 text-body-1">
                                <v-text-field class="login-input px-2 py-2" style="border-radius: 12px;" :rules="[required, validEmail]" v-model="email" label="Email*:" variant="outlined"></v-text-field>
                            </p>
                            <!-- Password Field -->
                            <p class="my-5 mx-12 text-body-1">
                                <v-text-field class="login-input px-2 py-2" style="border-radius: 12px;" :rules="[required]" v-model="password" label="Password*:" variant="outlined" type="password"></v-text-field>
                            </p>
                        </v-col>    
                        <v-row class="ma-1" justify="end">
                            <!-- Create Account Button -->
                            <v-btn variant="text" class="my-4 text-white text-button" to="/createaccount">Create account</v-btn>
                            <!-- Login Button-->
                            <v-btn large type="submit" :disabled="!form" color="secondary" class="ma-4 text-button">Sign in</v-btn>
                        </v-row>
                    </v-form>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script setup>
    // Var declarations
    import { ref } from 'vue'
    import { onMounted } from 'vue'
    import { onBeforeUnmount } from 'vue';
    import { useNavbarStore } from '../stores/navbar_state';
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '../stores/user_login_state';
    const user = ref(JSON.parse(localStorage.getItem('user')))
    const email = ref('')
    const password = ref('')
    const store = useNavbarStore()
    const router = useRouter()
    const form = ref(false);
    const loginFail = ref(false);
    const errorMessage = ref('');
    const authStore = useAuthStore();

    // Call toggleNavBar() in the navbar pinia store 
    const toggleNavbar = () => {
        store.toggleNavbar()
    }

    /**
     * Rule set that confirms each field has a value
     * @param value input value in verify password field
     */
    function required (value){
        return !!value || 'Field is required';
    }

    /**
     * uses regex to check format of email inputted, does not check if email is valid or fake. That process will need to be done on the backend.
     */
    function validEmail(value){
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) || "Invalid email format";
    }

    async function loginAccount(){
        try {
            const Email = email.value.toLowerCase();
            const Password = password.value;
            const payload = {Email, Password};
            const response = await api.post("/api/auth/login", payload);
            if(response.data.success){
                const token = response.data.token;
                localStorage.setItem("token", token);
                authStore.setToken(token);
                router.replace('/');
            }
        } catch (error) {
            console.error("Failed to Login: ", error);
            const message = error.response?.data?.message;
            errorMessage.value = message ?? "Login failed";
            loginFail.value = true;
        }
    }

    
    /**
     * Handles keydown events. If the pressed key it not 'Enter', return, otherwise call login().
     * @param event the keydown event to handle
     */
    const handleEnter = (event) => {
        if(event.key !== 'Enter') {
            return
        }
        login()
    }

    /**
     * Logic to execute when the login page is mounted.
     */
    const initialize = () => {
        toggleNavbar()
    }

    /** 
     * Logic to execute before the login page in unmounted.
     */ 
    const reloadNavbar = () => {
        toggleNavbar()
    }

    /**
     * Called automatically when the login page is mounted.
     */ 
    onMounted(() => {
        initialize()
        if(user.value) {
            router.replace('/')
        }
        window.addEventListener('keydown', handleEnter)
    })

    /** 
     * Called automatically before the login page in unmounted.
     */
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