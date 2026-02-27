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
        <v-card-item style="padding-top: 2%;">
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>

</script>
<style>
</style>
