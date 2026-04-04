<template>
    <v-row class="d-flex fill-height align-center">
        <v-col cols="12" class="d-flex align-center justify-center ma-2">
            <v-card style="width: 40%;" variant="elevated">
                <v-card-title class="text-center pt-4 pb-4 font-weight-bold text-h5">Create Acccount</v-card-title>
                <v-divider class="mx-5"></v-divider>
                <v-card-item>
                    <v-form v-model="form" @submit.prevent="onSubmit">
                        <v-text-field class="mt-2 px-10" :rules="[required]" v-model="email" label="Email*:" variant="outlined"></v-text-field>
                        <v-text-field class="mt-2 px-10" :rules="[required]" v-model="username" label="Username*:" variant="outlined"></v-text-field>
                        <v-text-field class="mt-2 px-10" :rules="[required]" v-model="password" label="Password*:" variant="outlined"></v-text-field>
                        <v-text-field class="mt-2 px-10" :rules="[required, mustMatch]" label="Verify Password*:" variant="outlined"></v-text-field>
                        <v-btn class="jusitfy-center" :disabled="!form" color="secondary" size="large" type="submit" block>Sign Up</v-btn>
                    </v-form>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup>
/**
 * Things to implement: 
 *      api call that verifies email doesn't already have linked account and its a valid email
 *      UserId creation process
 *      All Api calls to create user
 *      Auto login after creation
 *      2FA
 *      Captcha
 */
import { ref, onMounted } from 'vue';

const form = ref(false);
const loading = ref(false);
const username = ref(null);
const email = ref(null);
const password = ref(null);

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


function onSubmit() {
    if(form.value) return
    loading.value = true;
    setTimeout(()=>(loading.value = false), 2000)
}
</script>