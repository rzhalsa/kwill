<template>
	<v-card class="gradient-home" height="100%">
		<v-col class="ma-16 d-flex flex-column align-center">
			<!-- Title -->
			<img class="mb-3 logo-img-home" src="../assets/icon-small-margin.png" v-if="theme.global.name.value==='kwillTheme'" />
			<img class="mb-3 logo-img-home" src="../assets/icon2-small-margin.png" v-else />
			<v-card elevation="4" max-width="min(75vw, 1100px)">
				<v-row>
					<v-col cols="8">
						<v-row>
							<v-col>
								<!-- Welcome section -->
								<v-card elevation="6" class="gradient-db-card" style="margin-left: 5%; margin-top:5%; outline: solid black 3px;">
									<v-card-title class="text-center text-h4">Welcome!</v-card-title>
									<v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
									<v-card-item>
										<v-card-text style="padding-top: 2%;" class="text-center text-h5">
											<div class="mb-6 card-text">Welcome to Kwill! Kwill is a webapp which can generate, store, and update user-created smart <i>Dungeons and Dragons</i> character sheets. You can also download your characters locally.</div>
											<div class="mb-6 card-text">Additional smart functionality includes automated field calculations, real-time spell tooltips, and much more!</div>
											<div class="mb-6 card-text">New? Create a free account <b><router-link to="/createaccount">here</router-link></b> to save your characters.</div>
											<div class="mb-6 card-text">Need help? Take a look at the Guide page.</div>
										</v-card-text>
									</v-card-item>
								</v-card>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<!-- Why Kwill? section -->
								<v-card elevation="6" class="gradient-db-card" style="margin-bottom: 5%; margin-left: 5%; outline: solid black 3px;">
									<v-card-title class="text-center text-h4">Why Kwill?</v-card-title>
									<v-divider opacity=".7" thickness="3" gradient style="margin-left: 7%; margin-right: 7%;"></v-divider>
									<v-card-item>
										<v-card-text style="padding-top: 2%;" class="text-center text-h5">
											<div class="mb-6 card-text">Dungeons and Dragons is a fantasy roleplaying game where you create characters and go on adventures with others.</div>
											<div class="mb-6 card-text">As players ourselves, we want creating a character to be as hassle-free as possible. For this reason we built Kwill.</div>
											<div class="mb-6 card-text">The added smart-functionality on both our online sheet, as well as the smart version of the local sheet solve many common friction points while playing D&D. No more frantically looking up spells before your turn!</div>
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
									<router-link to="/guide" style="text-decoration: none; color: inherit;">
										<v-card>
											<v-card-title class="text-center">Guide</v-card-title>
											<v-card-item class="justify-center"><img src="../assets/community.png" style="height:120px; width: 120px;" /></v-card-item>
										</v-card>
									</router-link>
								</v-row>
								<v-row class="justify-center ma-2">
									<v-card>
										<router-link to="/account" style="text-decoration: none; color: inherit;">
											<v-card-title class="text-center">Account</v-card-title>
											<v-card-item class="justify-center"><img src="../assets/community.png" style="height:120px; width: 120px;" /></v-card-item>
										</router-link>
									</v-card>
								</v-row>
							</v-card-item>
						</v-card>
					</v-col>
				</v-row>
				<div class="d-flex justify-center my-8">
					<v-btn color="primary"
						   prepend-icon="mdi-download"
						   @click="showDownloadDialog = true">
					</v-btn>
				</div>
			</v-card>
		</v-col>
		<v-col>
			<!-- License and names -->
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
	<v-dialog v-model="showDownloadDialog" width="500">
		<v-card>
			<v-card-title>Download Blank Character Sheet</v-card-title>

			<v-divider></v-divider>

			<v-card-text>
				<v-radio-group v-model="selectedSheetType">
					<v-radio label="Download Simple Character Sheet"
							 value="simple"></v-radio>

					<v-radio label="Download Smart Character Sheet"
							 value="smart"></v-radio>
				</v-radio-group>
			</v-card-text>

			<v-card-actions class="d-flex justify-end">
				<v-btn variant="text" @click="showDownloadDialog = false">
					Cancel
				</v-btn>

				<v-btn color="primary" @click="downloadBlankSheet">
					Download
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup>
    import { ref } from 'vue';
	import { RouterLink } from 'vue-router';
	import { useTheme } from 'vuetify'	
  	import { onMounted } from 'vue';
  	import api from '../services/api';
	import { useAuthStore } from '../stores/user_login_state';
    import JSZip from 'jszip';
    import { simpleSheetHTML, smartSheetHTML } from '../sheets';
	const theme = useTheme()
	const authStore = useAuthStore();

    const showDownloadDialog = ref(false);
    const selectedSheetType = ref('simple');

    async function downloadBlankSheet() {
        const zip = new JSZip();

        if (selectedSheetType.value === 'simple') {
            zip.file('KwillSimpleCharacterSheet.html', simpleSheetHTML);
        } else if (selectedSheetType.value === 'smart') {
            zip.file('KwillSmartCharacterSheet.html', smartSheetHTML);
        }

        const assetsFolder = zip.folder('assets');

        const kwillSvg = await import('../sheets/assets/kwill.svg?raw');
        const scripts = await import('../sheets/assets/scripts.js?raw');
        const stylesCss = await import('../sheets/assets/styles.css?raw');

        assetsFolder.file('kwill.svg', kwillSvg.default);
        assetsFolder.file('scripts.js', scripts.default);
        assetsFolder.file('styles.css', stylesCss.default);

        zip.folder('characters');

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Kwill${selectedSheetType.value.charAt(0).toUpperCase() + selectedSheetType.value.slice(1)}BlankCharacterSheet.zip`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showDownloadDialog.value = false;
    }
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
