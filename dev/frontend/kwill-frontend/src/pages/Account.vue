<template>
    <v-row>
        <v-col cols="6">
            <v-card elevation="8" class="ma-4">
                <v-card-title class="bg-primary d-flex justify-center">Account Information</v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <p><strong>Username:</strong> {{ authStore.user?.username }}</p>
                    <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
                    
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="6">
            <v-card elevation="8" class="ma-4">
                <v-card-title class="bg-primary d-flex justify-center">Account Settings</v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                        <p><strong>Account Actions:</strong></p>
                        <p class="ma-3"><v-btn color="secondary" to="/" @click="authStore.logout()">Logout</v-btn></p>
                        <p class="ma-3"><v-btn color="secondary" @click="">Delete Account</v-btn></p>
                        <p class="ma-3"><v-btn color="secondary" @click="">Change Password</v-btn></p>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
    <v-dialog v-model="showLoginDialog" width="50dvw">
        <v-card>
            <v-card-title>Login Required</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <p>You must be logged in to access the Accounts page. Please log in or create an account to continue.</p>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn to="/">Cancel</v-btn>
                <v-btn color="primary" to="/login">Login</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import {ref, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/user_login_state';
const authStore = useAuthStore();
const showLoginDialog = computed(() => authStore.showLogin);

async function deleteAccount() {
    try {
        await api.delete(`/api/users/${authStore.user?.userId}`);
        authStore.logout(); // Log the user out after deleting the account
    } catch (error) {
        console.error('Failed to delete account:', error);
        // Optionally, show an error message to the user
    }
}
</script>