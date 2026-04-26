<template>
  	<v-card class="gradient-home" height="100%">
		<v-col class="ma-16 d-flex flex-column align-center">
			<!-- Title -->
			<img class="mb-3 logo-img-home" src="../assets/icon-small-margin.png" v-if="theme.global.name.value==='kwillTheme'"/>
			<img class="mb-3 logo-img-home" src="../assets/icon2-small-margin.png" v-else/>
			<v-card elevation="4">
				<v-row>
					<v-col cols="8">
						<v-row>
							<v-col>
								<!-- Welcome section -->
								<v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-top:5%; outline: solid black 3px;">
									<v-card-title class="text-center text-h4">Welcome!</v-card-title>
									<v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
									<v-card-item>
										<v-card-text style="padding-top: 2%;" class="text-center text-h5" >
											<div class="mb-6 card-text">Welcome to Kwill! Kwill is a webapp which can generate, store, and <br> update user-created smart <i>Dungeons and Dragons</i> character sheets. You <br> can also download your characters locally.</div>
											<div class="mb-6 card-text">Additional smart functionality includes automated field calculations,<br> real-time spell tooltips, and much more!</div>
											<div class="mb-6 card-text">New? Create a free account <b><router-link to="/createaccount">here</router-link></b> to save your characters.</div>
										</v-card-text>
									</v-card-item>
								</v-card>
							</v-col>	
						</v-row>	
						<v-row>
							<v-col>
								<v-card elevation="6" class="gradient-db-card" style="margin-bottom: 5%; margin-left: 5%; outline: solid black 3px;">
									<v-card-title class="text-center text-h4">Why Kwill?</v-card-title>
									<v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
									<v-card-item>
										<v-card-text style="padding-top: 2%;" class="text-center text-h5" >
											<div class="mb-6 card-text">Dungeons and Dragons is a fantasy roleplaying game where you create characters and go on adventures with others.</div>
											<div class="mb-6 card-text">As players ourselves, we want creating a character to be as hassle-free<br> as possible. For this reason we built Kwill.</div>
											<div class="mb-6 card-text">The added smart-functionality on both our online sheet, as well as the smart<br> version of the local sheet solve many common friction points while playing D&D.<br> No more frantically looking up spells before your turn!</div>
										</v-card-text>
									</v-card-item>
								</v-card>
							</v-col>
						</v-row>
					</v-col>
					<v-col cols="4">
						<!-- Quick access section -->
						<v-card elevation="6" class="gradient-db-card" style="margin-right: 10%; margin-top:10%; outline: solid black 3px;">
							<v-card-title class="text-center text-h4">Quick Access</v-card-title>
							<v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
							<v-card-item>
								<v-row class="justify-center ma-2">
									<router-link to="/characters" style="text-decoration: none; color: inherit;">
										<v-card>
										<v-card-title class="text-center">Characters</v-card-title>
										<v-card-item class="justify-center"><img src="../assets/community.png" style="height:120px; width: 120px;" /></v-card-item>
										</v-card>
									</router-link>
								</v-row>
								<v-row class="justify-center ma-2">
									<router-link to="/characters" style="text-decoration: none; color: inherit;">
										<v-card>
										<v-card-title class="text-center">Guide</v-card-title>
										<v-card-item class="justify-center"><img src="../assets/community.png" style="height:120px; width: 120px;" /></v-card-item>
										</v-card>
									</router-link>
								</v-row>
								<v-row class="justify-center ma-2">
									<v-card>
										<v-card-title class="text-center">Account</v-card-title>
										<v-card-item class="justify-center"><img src="../assets/community.png" style="height:120px; width: 120px;" /></v-card-item>
									</v-card>
								</v-row>
							</v-card-item>
						</v-card>
					</v-col>
				</v-row>
			</v-card>
		</v-col>
		<v-col>
			<v-divider opacity=".7" thickness="3" gradient></v-divider>
			<div class="text-center ma-4">
				<p class="license-text">Released under the MIT License.</p>
				<p class="license-text">Copyright (c) 2026-present Ryan McHenry</p>
				<p class="license-text">Copyright (c) 2026-present Kyle Slusser</p>
				<p class="license-text">Copyright (c) 2026-present Evan Farling</p>
				<p class="license-text">Copyright (c) 2026-present Samuel Collins</p>
				<p class="license-text mb-2">Copyright (c) 2026-present Kristopher Duffy</p>
			</div>	
		</v-col>
  	</v-card>
</template>

<script setup>
    import { ref } from 'vue';
	import { RouterLink } from 'vue-router';
	import { useTheme } from 'vuetify'
	const theme = useTheme()
</script>

<style>
  .center-homepage {
        place-items: center;
    }

	.logo-img-home {
        height: clamp(5rem, calc(5vw + 4rem), 15rem); 
    }

    .card-text {
        font-size: clamp(1rem, calc(1vw + 0.1rem), 2.5rem);
    }

	.license-text {
		font-size: clamp(0.8rem, calc(0.75vw + 0.3rem), 1.4rem);
	}
</style>
