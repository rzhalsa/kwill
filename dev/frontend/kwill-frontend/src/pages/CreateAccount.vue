<template>
    <v-snackbar location="top" color="secondary" v-model="createAccountFail" timeout="1500">
        <div class="d-flex justify-center text-h6">{{errorMessage}}</div>
    </v-snackbar>
    <v-row class="d-flex fill-height align-center">
        <v-col cols="12" class="d-flex align-center justify-center ma-2">
            <v-card style="width: 40%;" variant="elevated">
                <v-card-title class="text-center pt-4 pb-4 font-weight-bold text-h5">Create Acccount</v-card-title>
                <v-divider class="mx-5"></v-divider>
                <v-card-item>
                    <v-form v-model="form" @submit.prevent="createAccount">
                        <v-text-field class="mt-2 px-10" :rules="[required, validEmail]" v-model="email" label="Email*:" variant="outlined"></v-text-field>
                        <v-text-field class="mt-2 px-10" :rules="[required]" v-model="username" label="Username*:" variant="outlined"></v-text-field>
                        <v-text-field class="mt-2 px-10" :rules="[required, passwordStrength]" v-model="password" label="Password*:" variant="outlined" :type="showPassword ? 'text':'password'"
                            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword"></v-text-field>
                        <div class="text-caption px-10 ">Password Must Contain:</div>
                        <div class="text-caption px-14">*At least 8 characters</div>
                        <div class="text-caption px-14">*One uppercase letter</div>
                        <div class="text-caption px-14">*One lowercase letter</div>
                        <div class="text-caption px-14">*One number</div>
                        <div class="text-caption px-14">*One special character (!,@,#,$,%,*)</div>
                        <v-text-field class="mt-3 px-10" :rules="[required, mustMatch]" label="Verify Password*:" variant="outlined" :type="showVerifyPassword ? 'text':'password'"
                            :append-inner-icon="showVerifyPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showVerifyPassword = !showVerifyPassword"></v-text-field>
                        <v-btn type="submit" class="jusitfy-center" :disabled="!form" color="secondary" size="large" block>Sign Up</v-btn>
                        <div class="mt-5 d-flex justify-center" id="turnstile-container"></div>
                    </v-form>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup>
/**
 * Things to implement: 
 *      api call that verifies email doesn't already have linked account and its a valid email - done
 *      All Api calls to create user - done
 *      Auto login after creation - in progess
 *      2FA -  not adding yet
 *      Captcha  - link to backend
 *      warnings if email already exists, or username - Done
 *      If user is already loggedin make then logout aka make a logout dialogue
 *      Does not check if email is valid nor if username is not obscenely named.
 */
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/user_login_state';
import api from '../services/api';
const router = useRouter();
const form = ref(false);
const username = ref(null);
const email = ref(null);
const password = ref(null);
const showPassword = ref(false);
const showVerifyPassword = ref(false);
const createAccountFail = ref(false);
const errorMessage = ref('');
const captchaToken = ref(null);
const authStore = useAuthStore();


/**
 * Rule set that confirms second password matches first
 * @param value input value in verify password field
 */
function mustMatch(value){
    return value === password.value || 'Passwords must match';
}
/**
 * Rule set that confirms each field has a value
 * @param value input value in verify password field
 */
function required (value){
    return !!value || 'Field is required';
}
/**
 * Rule set that confirms each password has a min length of 8
 * @param value input value in verify password field
 */
function passwordStrength(value){
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    let hasSpecial = false;
    for(const char of value){
        if(char >= 'A' && char <= 'Z') hasUpper=true;
        if(char >= 'a' && char <= 'z') hasLower=true;
        if(char >= '0' && char <= '9') hasNumber=true;
        if(char == '!' ||char == '@' ||char == '#' ||char == '$' ||char == '%' ||char == '?' || char == '*') hasSpecial = true;
    }
    return (value.length >=8 && hasUpper && hasLower && hasSpecial) || 'Password does not meet requirements';
}
/**
 * uses regex to check format of email inputted, does not check if email is valid or fake. That process will need to be done on the backend.
 */
function validEmail(value){
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) || "Invalid email format";
}

onMounted(() => {
    if (window.turnstile) {
        window.turnstile.render('#turnstile-container', {
            sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
            callback: (token) => {
                captchaToken.value = token
            }
        })
    }
})

/**
 * Builds user payload to send to api end point, grabs and sets JWT from backend and updates local and pinia store to 
 * automatically log the user in after creation and pushes them to the homepage. If creations fails sets error message
 * to be displayed.
 */
async function createAccount(){
    //Checks if captcha is completed
    if (!captchaToken.value) {
        errorMessage.value = "Please complete the captcha"
        createAccountFail.value = true
        return
    }
    try {
        const Email = email.value.toLowerCase();
        const Username = username.value;
        const Password = password.value;
        const CaptchaToken = captchaToken.value;
        const payload = {Email, Username, Password, CaptchaToken};
        const response = await api.post("/api/auth/register", payload);
        if(response.data.success){
            const token = response.data.token;
            localStorage.setItem("token", token);
            authStore.setToken(token);
            // Fetch and set user data before navigating
            try {
                const userRes = await api.get("/api/auth/me");
                authStore.setUser(userRes.data);
            } catch (err) {
                console.error("Failed to fetch user data: ", err);
            }
            router.push('/');
        }
    } catch (error) {
        console.error("Failed to Create Account: ", error);
        const message = error.response?.data?.message;
        errorMessage.value = message ?? "Account creation failed";
        createAccountFail.value = true;
    }
}

</script>