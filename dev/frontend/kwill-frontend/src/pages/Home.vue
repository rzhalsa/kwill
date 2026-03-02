<template>
  <v-row>
    <v-col >
      <v-card class="gradient-topcard " style="padding-left: 20%; padding-top: 5%;">
        <v-card-title class="ma-4 text-h3">Welcome to Kwill</v-card-title>
        <v-card-subtitle class="ma-4 text-h5">A Smart Portable D&D Character Sheet</v-card-subtitle>
        <v-card-item class="">
            <v-col>
              <v-btn color="secondary" class="mr-2" >Get Started</v-btn>
              <v-btn color="secondary" >Sign Up</v-btn>
            </v-col>
            <v-col>
              <v-btn color="secondary" class="mr-2" variant="outlined" >Why Kwill?</v-btn>
            </v-col>
            
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-card class="gradient-card mt-n6" style="padding-top: 5%; padding-bottom: 10%;">
        <v-card-title class="ma-4 text-h4" style="padding-left: 45%;">Dashboard</v-card-title>
        <v-divider style="margin-left: 3%; margin-right: 3%;"></v-divider>
        <v-card-item  style="margin-top: 5%;">
          <v-row class="justify-center">
            <v-col cols="2">
              <router-link to="/characters" style="text-decoration: none; color: inherit;">
                <v-card>
                  <v-card-title class="text-center">Characters</v-card-title>
                  <v-card-item class="justify-center"><img src="../assets/community.png" style="height:100px; width: 100px;" /></v-card-item>
                </v-card>
              </router-link>
            </v-col>
            <v-col cols="2">
              <router-link to="/characters" style="text-decoration: none; color: inherit;">
                <v-card>
                  <v-card-title class="text-center">Community</v-card-title>
                  <v-card-item class="justify-center"><img src="../assets/community.png" style="height:100px; width: 100px;" /></v-card-item>
                </v-card>
              </router-link>
            </v-col>
            <v-col cols="2">
              <v-card>
                <v-card-title class="text-center">Account</v-card-title>
                <v-card-item class="justify-center"><img src="../assets/community.png" style="height:100px; width: 100px;" /></v-card-item>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="justify-center">
            <v-col cols="2">
              <router-link to="/" style="text-decoration: none; color: inherit;">
                <v-card>
                  <v-card-title class="text-center">Guides</v-card-title>
                  <v-card-item class="justify-center"><img src="../assets/community.png" style="height:100px; width: 100px;" /></v-card-item>
                </v-card>
              </router-link>
            </v-col>
            <v-col cols="2">
              <router-link to="/" style="text-decoration: none; color: inherit;">
                <v-card>
                  <v-card-title class="text-center">FAQs</v-card-title>
                  <v-card-item class="justify-center"><img src="../assets/community.png" style="height:100px; width: 100px;" /></v-card-item>
                </v-card>
              </router-link>
            </v-col>
            <v-col cols="2">
              <router-link to="/" style="text-decoration: none; color: inherit;">
                <v-card>
                  <v-card-title class="text-center">Guides</v-card-title>
                  <v-card-item class="justify-center"><img src="../assets/community.png" style="height:100px; width: 100px;" /></v-card-item>
                </v-card>
              </router-link>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-card class="gradient-card mt-n6" style=" padding-bottom: 10%;">
        <v-card-title class="ma-4 text-h4" style="padding-left: 45%;">About</v-card-title>
        <v-divider style="margin-left: 3%; margin-right: 3%;"></v-divider>
        <v-card-text style="padding-top: 2%;" class="text-center text-accent text-h5" >
            <div class="mb-2">Kwill is a webapp which can generate, store, and update user-created smart D&D character sheets.</div>
            <div class="mb-2">Once released, Kwill will support the following features:</div>
            <div class="mb-2">Generating user-specified smart D&D character sheets automatically. </div>
            <div class="mb-2">Smart character sheets will support features such as:</div>
            <div class="mb-2">Fields being automatically populated with calculated values.</div>
            <div class="mb-2">Tooltips on mouse hover for features and spells.</div>
            <div class="mb-2">Built-in tools to aid in tasks such as skill checks, attacks, rests, or level ups.</div>
            <div class="mb-2">Allowing users to view all their created character sheets on their account dashboard.</div>
            <div class="mb-2">Allowing users to export a character sheet locally to their own machine.</div>
            <div class="mb-2">Allowing users to import a locally stored character sheet to the webapp.</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>

</script>
<style>
</style>
