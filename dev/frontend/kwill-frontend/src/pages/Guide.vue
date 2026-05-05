<template>
    <v-card class="gradient-home" height="100%">
        <v-col class="ma-16 d-flex flex-column align-center">
            <v-card elevation="4" max-width="min(65vw, 1100px)">
                <!-- Guide for the guide page -->
                <v-row>
                    <v-col>
                        <v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-top:5%; margin-right: 5%; outline: solid black 3px;">
                            <v-card-title class="text-center text-h4">Guide Page</v-card-title>
                            <v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
                            <v-card-item>
                                <v-card-text style="padding-top: 2%;" class="text-center text-h5" >
                                    <div class="mb-6 card-text">This page is intended to serve as a reference for using Kwill. It contains sections on creating an account, creating a character, and importing as well as exporting characters.</div>
                                    <div class="mb-6 card-text">This page will be updated as needed to assist new users effectively.</div>
                                </v-card-text>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
                <!-- Creating an account -->
                <v-row>
                    <v-col>
                        <v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-right: 5%; outline: solid black 3px;">
                            <v-card-title class="text-center text-h4">Creating an Account</v-card-title>
                            <v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
                            <v-card-item>
                                <v-card-text style="padding-top: 2%;" class="text-center text-h5" >
                                    <div class="mb-6 card-text">To create an account, navigate to the Sign In page. On the Sign In page you will see a button at the bottom named 'Create Account'. Clicking that button will redirect you to the create account page.</div>
                                    <div class="mb-6 card-text">All accounts must have a valid email and passwords must contain the requirements listed on the create account page.</div>
                                    <div class="mb-6 card-text">Once you have created an account, you can log in normally with just an email and password.</div>
                                </v-card-text>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
                <!-- Creating a Character-->
                <v-row>
                    <v-col>
                        <v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-right: 5%; outline: solid black 3px;">
                            <v-card-title class="text-center text-h4">Creating a Character</v-card-title>
                            <v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
                            <v-card-item>
                                <v-card-text style="padding-top: 2%;" class="text-center text-h5" >
                                    <div class="mb-6 card-text">To create a new character, navigate to the Characters page. Once there, you will see a + button on the left side of the screen. Pressing this button will redirect you to the character creation process.</div>
                                    <div class="mb-6 card-text">Once you've created a character, it'll be accessible on the left side of the Characters page while logged-in. An account may store a maximum of <b>6</b> characters on the cloud at a time.</div>
                                    <div class="mb-6 card-text">Only logged-in users may create characters as of the most recent build. We would like to add the ability to create characters without an account in the future.</div>
                                </v-card-text>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
                <!-- Importing/Exporting Characters-->
                <v-row>
                    <v-col>
                        <v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-right: 5%; outline: solid black 3px;">
                            <v-card-title class="text-center text-h4">Importing/Exporting Characters</v-card-title>
                            <v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
                            <v-card-item>
                                <v-card-text style="padding-top: 2%;" class="text-center text-h5" >
                                    <div class="mb-6 card-text">Kwill allows you to easily move your characters between the cloud and local storage via the use of importing and exporting.</div>
                                    <div class="mb-6 card-text">To import a character from your local computer, or export a character to your local computer, navigate to the Characters page. On the right side of the page you will see 3 buttons. The top one is for importing a character and the middle one is for exporting a character.</div>
                                    <div class="mb-6 card-text">Importing a character involves uploading the character's data from your computer. It will be located in a .json file.</div>
                                    <div class="mb-6 card-text">Additionaly, the third button on the bottom allows you to download a blank character sheet locally.</div>
                                </v-card-text>
                            </v-card-item>
                        </v-card>
                    </v-col>
                <!-- Using the local sheet -->
                </v-row>
                <v-row>
                    <v-col>
                        <v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-right: 5%; outline: solid black 3px;">
                            <v-card-title class="text-center text-h4">Using the Local Sheet</v-card-title>
                            <v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
                            <v-card-item>
                                <v-card-text style="padding-top: 2%;" class="text-center text-h5" >
                                    <div class="mb-6 card-text">Exporting a character allows you to access your characters locally with a local version of our sheet.</div>
                                    <div class="mb-6 card-text">In the location you exported your character to, there will be a .html file.</div>
                                    <div class="mb-6 card-text">Open this file in your browser of choice to access your characters. While it works in a browser, no internet connection is required!</div>
                                    <div class="mb-6 card-text">You can access all of your locally-downloaded characters via a dropdown at the top of the page!</div>
                                </v-card-text>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        
                    </v-col>
                </v-row>
            </v-card>
        </v-col>
    </v-card>  
</template>

<script setup>
    import { ref } from 'vue';
</script>

<style>
</style>