<template>
  <v-row>
    <v-col>
      <v-card class="gradient-card ma-1">
        <v-card-title class="ma-4 text-h4">Welcome to Kwill!</v-card-title>
        <v-card-subtitle class="ma-4 text-h5">An All in One D&D Character Sheet</v-card-subtitle>
        <v-card-item>
            <v-col>
              <v-btn color="secondary" class="mr-2">Get Started</v-btn>
              <v-btn color="secondary">Sign Up</v-btn>
            </v-col>
            <v-col>
              <v-btn color="secondary" class="mr-2">Guide</v-btn>
              <v-btn color="secondary">Why Kwill?</v-btn>
            </v-col>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
  <v-divider></v-divider>
  <v-row>
    <v-col>
      <v-card class="gradient-card ma-1">
        <v-card-title class="ma-4 text-h4">Dashboard</v-card-title>
        <v-card-item>
          <v-row class="justify-center">
            <v-col cols="1">
              <v-card>
                <v-card-title class="text-center">Characters</v-card-title>
                <v-card-item><!--image of characters--></v-card-item>
              </v-card>
            </v-col>
            <v-col cols="1">
              <v-card>
                <v-card-title class="text-center">Community</v-card-title>
                <v-card-item><!--image of community--></v-card-item>
              </v-card>
            </v-col>
            <v-col cols="1">
              <v-card>
                <v-card-title class="text-center">Account</v-card-title>
                <v-card-item><!--image of account--></v-card-item>
              </v-card>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
  <v-divider></v-divider>
  <v-row>
    <v-col>
      <v-card class="gradient-card ma-1">
        <v-card-title class="ma-4 text-h4">About</v-card-title>
        <v-card-item>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
<script setup>

</script>
<style>
</style>
