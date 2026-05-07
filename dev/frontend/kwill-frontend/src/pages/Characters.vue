<template>
    <v-row>
        <v-col cols="3">
            <v-card class="mt-4 ml-4 rounded-lg">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Characters</span>
                    <v-btn title="New Character" icon="mdi-plus" color="primary" to="charactercreator" v-tooltip="'New Character'"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-list>
                        <v-list-item
                            v-for="(character, index) in characterStore.characterList" 
                            :key="character.characterId"
                            v-if="loaded"
                            lines="two"
                            :title="character.name || 'Unnamed Character'"
                            :value="character"
                            :active="character.characterId === characterStore.selectedCharacterId"
                            @click="fetchCharData(character.characterId)"
                        >
                            <template v-slot:append >
                                <v-btn
                                    color="grey-lighten"
                                    icon="mdi-delete-circle"
                                    v-tooltip="'Delete character'"
                                    variant="text"
                                    @click="characterToDelete = character.characterId; showDeleteDialog = true;"
                                ></v-btn>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="9">
            <div class="d-flex gap-3">
                <v-card class="mt-4 mr-4 rounded-lg flex-grow-1" style="max-height: 100dvh; overflow-y: auto;">
                    <v-card-title></v-card-title>
                    <v-card-text>
                        <characterSheet v-if="showSheet" ref="sheetRef" @update:char-data="postCharData()" />
                        <div v-else class="d-flex justify-center align-center" style="height: 60dvh;">
                            <p class="text-h6">No characters found. Create a new character to get started!</p>
                        </div>
                    </v-card-text>
                    <v-card-actions></v-card-actions>
                </v-card>
                <div class="mt-4 d-flex flex-column pr-4">
                    <v-btn icon="mdi-upload" color="primary" v-tooltip="'Import character'"
                        @click="showImportDialog = true" class="mb-4"></v-btn>
                    <v-btn icon="mdi-export" color="primary" v-tooltip="'Export character'" @click="exportCharacter"
                        class="mb-4"></v-btn>
                    <v-btn icon="mdi-download" color="primary" v-tooltip="'Download local sheet'"
                        @click="showDownloadDialog = true"></v-btn>
                </div>
            </div>
        </v-col>
    </v-row>

    <v-dialog v-model="showImportDialog" width="50dvw">
        <v-card>
            <v-card-title>Import Character</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="d-flex flex-column gap-4">
                    <!-- Drag and Drop Area -->
                    <div @drop.prevent="handleFileDrop" @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false" :style="{
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            padding: '32px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: isDragging ? '#f0f0f0' : '#fafafa',
                            transition: 'all 0.3s'
                        }">
                        <p class="mb-2">Drag and drop a JSON file here</p>
                        <p class="text-grey">or</p>
                        <v-btn color="primary" size="small" @click.stop="fileInput.click()">
                            Browse Local Files
                        </v-btn>
                        <input ref="fileInput" type="file" accept=".json" style="display: none;"
                            @change="handleFileSelect" />
                    </div>

                    <!-- Selected File Display -->
                    <div v-if="selectedFile" class="pa-3" style="background-color: #f5f5f5; border-radius: 8px;">
                        <p class="mb-0"><strong>Selected file:</strong> {{ selectedFile.name }}</p>
                    </div>
                    <v-radio-group v-model="selectedImportType">
                        <v-radio label="Import as New Character" value="new"></v-radio>
                        <v-radio label="Import and Replace Current Character" value="replace"></v-radio>
                    </v-radio-group>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn variant="text" @click="closeImportDialog">Cancel</v-btn>
                <v-btn color="primary" @click="importFile" :disabled="!selectedFile || !selectedImportType">Import</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="showDownloadDialog" width="50dvw">
        <v-card>
            <v-card-title>Download Character Sheet</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="d-flex flex-column gap-4">
                    <div class="d-flex flex-column gap-2">
                        <v-radio-group v-model="selectedSheetType">
                            <v-radio label="Download Simple Character Sheet" value="simple"></v-radio>
                            <v-radio label="Download Smart Character Sheet" value="smart"></v-radio>
                        </v-radio-group>
                    </div>
                    <v-divider></v-divider>
                    <v-checkbox v-model="includeCharData" label="Include character data"></v-checkbox>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn variant="text" @click="showDownloadDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="downloadSheet">Download</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="showLoginDialog" width="50dvw">
        <v-card>
            <v-card-title>Login Required</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <p>You must be logged in to access the Characters page. Please log in or create an account to continue.</p>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn to="/">Cancel</v-btn>
                <v-btn color="primary" to="/login">Login</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="showDeleteDialog" width="50dvw">
        <v-card>
            <v-card-title>Confirm Delete</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <p>Are you sure you want to delete this character? This action cannot be undone.</p>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
                <v-btn color="red" @click="deleteCharacter">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="spellStore.showImport"  width="50dvw">
        <v-card>
            <v-card-title v-if="spellStore.level == 0">Import Cantrips</v-card-title>
            <v-card-title v-else>Import Level {{ spellStore.level }} Spells</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row>
                <v-select 
                    v-model="spellStore.classFilter" 
                    class="mr-3"
                    label="Class" variant="outlined" 
                    style="max-width: fit-content;"
                    :items="['paladin','bard','warlock','ranger','fighter','rogue','wizard','cleric','barbarian','sorcerer','monk','druid']" 
                    clearable
                    ></v-select>
                 <v-autocomplete
                    v-model="selectedSpell"
                    :items="spellStore.spells"
                    item-title="name"
                    return-object
                    label="Select a spell to import"
                    variant="outlined"
                    clearable/>
                </v-row>
                <v-btn color="primary" @click="sheetRef.handleAddSpell(spellStore.level, selectedSpell)" :disabled="!selectedSpell">Add Spell</v-btn>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn variant="text" @click="spellStore.showImport = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="spellStore.showFeatImport" @update:modelValue="selectedFeature=null" width="50dvw">
        <v-card>
            <v-card-title>Import Features</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                 <v-autocomplete
                    v-model="selectedFeature"
                    :items="spellStore.features"
                    item-title="name"
                    return-object
                    label="Select a feature to import"
                    variant="outlined"
                    clearable/>
                    <v-btn color="primary" @click="sheetRef.handleAddFeature(selectedFeature)" :disabled="!selectedFeature">Add Feature</v-btn>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn variant="text" @click="spellStore.showFeatImport = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import JSZip from 'jszip';
import { simpleSheetHTML, smartSheetHTML } from '../sheets';
import { useCharacterCreationStore } from '../stores/character_creation_state'
import characterSheet from '../layouts/Sheet.vue';
import { ref, onMounted, computed, watch } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/user_login_state';
import { first } from 'lodash';
import {useSpellDialogStore} from '../stores/spells_state.js';
import { createCharacter} from '../models/characterModel';
import {createNewCharacter} from '../helpers/charCreationHelpers';
const character = createCharacter();
const authStore = useAuthStore(); //Store for user authentication and login state
const characterStore = useCharacterCreationStore(); //Store for character data and state, including selected character, character list, and character sheet updates
const spellStore = useSpellDialogStore(); //Store for spell import dialog state, including which level of spells to import and whether the dialog is open or closed
const userID = computed(() => authStore.user?.userId);
const showLoginDialog = computed(() => authStore.showLogin);
const sheetRef = ref();
const charData = ref();
const spellData = ref();
const includeCharData = ref(false);
const showDownloadDialog = ref(false);
const showImportDialog = ref(false);
const selectedSheetType = ref('simple');
const isDragging = ref(false);
const selectedFile = ref(null);
const fileInput = ref();
const loaded = ref(null);
const firstCharacter= ref(null);
const showSheet = ref(false);
const showDeleteDialog = ref(false);
const characterToDelete = ref(null);
const selectedSpell = ref(null);
const selectedFeature = ref(null);
const selectedImportType = ref(null);
const selectedClassSpells = ref(null);
const selectedClassFeatures = ref(null);
/**
 * Responsible for updating and populating values on the chracter sheet.
 */
function sendCharData() {
    sheetRef.value.populateSheet(charData.value);
    console.log("here");
}
/**
 * Fetches character data for a given character ID and populates the character sheet with the retrieved data. If the selected character ID is the same as the currently displayed character, 
 * it does nothing to avoid unnecessary API calls and re-rendering.
 * @param characterID 
 */
async function fetchCharData(characterID) {
    characterStore.selectedCharacterId = characterID;
    try {
        const response = await api.get(`/api/character/${characterID}`)
        const data = response.data;
        console.log("here3");
        console.log(data);
        charData.value = data;
        loaded.value = true;
        console.log('Character data retrieved:', charData.value);
        sendCharData();
    } catch (error) {
        console.error('Failed to fetch character data:', error);
    }
}
/**
 * Fetches the names and IDs of all characters for a given user and populates the character list. It then selects the first character to display on the sheet. 
 * If there are no characters, it sets the sheet to not show.
 */
async function fetchCharsName() {
    try {
        const response = await api.get(`/api/character/summaries/${userID.value}`)
        const data = response.data;
        console.log(data);
        characterStore.characterList = data.characters;
        loaded.value = true;
        firstCharacter.value = characterStore.characterList[0]?.characterId || null;
        console.log("here");
        if(firstCharacter.value != null){
            console.log("here2");
            console.log(firstCharacter.value);
            showSheet.value = true;
            fetchCharData(firstCharacter.value);
        }else{
            showSheet.value = false;
        }
    } catch (error) {
        console.error('Failed to fetch character data:', error);
    }
}
/**
 * Wipes previous selections for importing spells.
 */
watch(
    () => [spellStore.level, spellStore.classFilter, spellStore.showImport],
    ([level, classFilter, open]) => {
        if (open) {
            selectedSpell.value = null;
            spellStore.classFilter = null;
        }
    }
);
/**
 * Sends the currenttly selected chracter to the backend to delete the character data. It retrieves the characterId from the sheet component, 
 * sends it to the backend, and then refreshes the character list and data to reflect any changes.
 */
async function deleteCharacter() {
    try {
        await api.delete(`/api/character/${characterToDelete.value}`,{
            params: {
                userId: userID.value
            }
        });
        characterStore.characterList = characterStore.characterList.filter(c => c.characterId !== characterToDelete.value);
        showDeleteDialog.value = false;
        if (characterStore.selectedCharacterId === characterToDelete.value) {
            characterStore.selectedCharacterId = null;
            fetchCharsName();
        }
    } catch (error) {
        console.error('Failed to delete character:', error);
    }
}


/**
 * Lifecycle hook called when the component is mounted.
 */
onMounted(() => {
    console.log("Mounted Characters.vue, userID:", userID.value);
    fetchCharsName();
});

function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            selectedFile.value = file;
            console.log('File selected:', file.name);
        } else {
            alert('Please drop a JSON file');
        }
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        selectedFile.value = files[0];
        console.log('File selected:', files[0].name);
    }
}


async function importFile() {
    if (!selectedFile.value) return;

    try {
        const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(selectedFile.value);
        });

        console.log('File text:', text);
        console.log('Parsed:', JSON.parse(text));
        const parsed = JSON.parse(text);

        // remove Mongo-generated identifiers
        delete parsed._id;
        delete parsed.characterid;

        // remove bad accidental key if present
        if (parsed.spells) {
            delete parsed.spells["[object Object]"];
        }
        if(selectedImportType.value === 'new'){
            createNewCharacter(parsed, userID.value);
            await fetchCharsName();
        } 
        else if (selectedImportType.value === 'replace') {
            sheetRef.value.populateSheet(parsed);
        }else{
            alert('Please select an import type');
            return;
        }
        closeImportDialog();
    } catch (error) {
        console.error('Failed to import file:', error);
        console.error('Error message:', error.message);
        alert('Failed to import file. Make sure it\'s a valid JSON file. Error: ' + error.message);
    }
}

function closeImportDialog() {
    showImportDialog.value = false;
    selectedFile.value = null;
}

async function downloadSheet() {
    const zip = new JSZip();

    // Add the appropriate sheet HTML
    if (selectedSheetType.value === 'simple') {
        zip.file('KwillSimpleCharacterSheet.html', simpleSheetHTML);
    } else if (selectedSheetType.value === 'smart') {
        zip.file('KwillSmartCharacterSheet.html', smartSheetHTML);
    }

    // Add assets folder and its contents
    const assetsFolder = zip.folder('assets');

    // Import all assets
    const kiwillSvg = await import('../sheets/assets/kwill.svg?raw');
    const scripts = await import('../sheets/assets/scripts.js?raw');
    const stylesCss = await import('../sheets/assets/styles.css?raw');

    assetsFolder.file('kwill.svg', kiwillSvg.default);
    assetsFolder.file('scripts.js', scripts.default);
    assetsFolder.file('styles.css', stylesCss.default);

    // Add characters folder
    const charactersFolder = zip.folder('characters');

    // Add character data ONLY if checkbox is selected
    if (includeCharData.value) {
        const characterData = sheetRef.value.getCharacterData();
    charactersFolder.file(
        `${characterData.name || 'character'}.json`, 
        JSON.stringify(characterData, null, 2)
    );
    }

    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kwill${selectedSheetType.value.charAt(0).toUpperCase() + selectedSheetType.value.slice(1)}CharacterSheet.zip`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close dialog
    showDownloadDialog.value = false;
}


// Exports the current state of the sheet to json
function exportCharacter() {
    authStore.isExporting = true;// Set exporting state to true to disable export button and prevent multiple exports at once

    const raw = sheetRef.value.getCharacterData();
    
    if (!raw || !raw.name) {
        alert('No character data to export');
        return;
    }
    
    const characterToExport = JSON.parse(JSON.stringify(raw));

    const jsonString = JSON.stringify(characterToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${characterToExport.name || 'character'}.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    authStore.isExporting = false;// Reset exporting state after export is complete
}

</script>
