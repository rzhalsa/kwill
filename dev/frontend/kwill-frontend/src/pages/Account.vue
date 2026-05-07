<template>
    <v-snackbar location="top" color="secondary" v-model="deleteAccountFail" timeout="1500">
        <div class="d-flex justify-center text-h6">{{errorMessage}}</div>
    </v-snackbar>
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
                        <p class="ma-3"><v-btn color="secondary" @click="showDeleteDialog = true">Delete Account</v-btn></p>
                        <p class="ma-3"><v-btn color="secondary" @click="showChangePasswordDialog = true">Change Password</v-btn></p>
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
    <v-dialog v-model="showDeleteDialog">
        <v-card>
            <v-card-title>Confirm Account Deletion</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                Are you sure you want to delete your account? This action cannot be undone.
                <v-text-field class="ma-2" variant="outlined" v-model="deletePassword" label="Enter your password to confirm" :type="showDeletePassword ? 'text':'password'"
                            :append-inner-icon="showDeletePassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showDeletePassword = !showDeletePassword"></v-text-field>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
                <v-btn color="red" @click="deleteAccount()">Delete Account</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="showChangePasswordDialog">
        <v-card>
            <v-card-title>Change Password</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <!-- Change password form goes here -->
                This process will log you out and require you to log back in with your new password.
                <v-text-field class="ma-2" variant="outlined" v-model="currentPassword" label="Enter your current password":type="showCurrentPassword ? 'text':'password'"
                            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showCurrentPassword = !showCurrentPassword"></v-text-field>
                <v-text-field class="ma-2" variant="outlined" v-model="newPassword" label="Enter your new password" :type="showNewPassword ? 'text':'password'"
                            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showNewPassword = !showNewPassword"></v-text-field>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn @click="showChangePasswordDialog = false">Close</v-btn>
                <v-btn color="red" @click="changePassword()">Change Password</v-btn>
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
const showDeleteDialog = ref(false);
const showChangePasswordDialog = ref(false);
const deletePassword = ref('');
const errorMessage = ref('');
const deleteAccountFail = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const showDeletePassword = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);

async function deleteAccount() {
    try {
        await api.delete('/api/auth/account',{
            data:{
                password: deletePassword.value
            }
        });
        showDeleteDialog.value = false;
        authStore.logout(); // Log the user out after deleting the account
    } catch (error) {
        console.error('Failed to delete account:', error);
        const message = error.response?.data?.message;
        errorMessage.value = message ?? "Account deletion failed";
        deleteAccountFail.value = true;
    }
}

async function changePassword() {
    try {
        await api.put('/api/auth/change-password',{
            currentPassword: currentPassword.value,
            newPassword: newPassword.value
        });
        showChangePasswordDialog.value = false;
        authStore.logout(); // Log the user out after deleting the account
    } catch (error) {
        console.error('Failed to change password:', error);
        const message = error.response?.data?.message;
        errorMessage.value = message ?? "Password change failed";
        deleteAccountFail.value = true;
    }
}
</script>