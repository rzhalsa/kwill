<template>
    <v-row>
        <v-col cols="3">
            <v-card class="mt-4 ml-4 rounded-lg">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Characters</span>
                    <v-btn title="New Character" icon="mdi-plus"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="9">
            <div class="d-flex gap-3">
                <v-card class="mt-4 mr-4 rounded-lg flex-grow-1" style="max-height: 100dvh; overflow-y: auto;">
                    <v-card-title></v-card-title>
                    <v-card-text>
                        <characterSheet ref="sheetRef" @update:char-data="postCharData()" />
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
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end gap-2">
                <v-btn variant="text" @click="closeImportDialog">Cancel</v-btn>
                <v-btn color="primary" @click="importFile" :disabled="!selectedFile">Import</v-btn>
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
</template>

<script setup>
import JSZip from 'jszip';
import { simple_character_sheet, smart_character_sheet } from '@/sheets';
import characterSheet from '../layouts/Sheet.vue';
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

const userID = ref(1);
const characterID = ref(1);
const sheetRef = ref();
const charData = ref();
const includeCharData = ref(false);
const showDownloadDialog = ref(false);
const showImportDialog = ref(false);
const selectedSheetType = ref('simple');
const isDragging = ref(false);
const selectedFile = ref(null);
const fileInput = ref();

function getCharData() {

}

function sendCharData() {
    sheetRef.value.populateSheet(charData.value);
    console.log("here");
}

async function fetchCharData() {
    try {
        const response = await api.get(`/api/character/${userID.value}/${characterID.value}`)
        const data = response.data;
        console.log(data);
        charData.value = data;
        console.log('Character data retrieved:', charData.value);
        sendCharData();
    } catch (error) {
        console.error('Failed to fetch character data:', error);
    }
}

onMounted(() => {
    fetchCharData();
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

        sheetRef.value.populateSheet(text);

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
    const kiwillSvg = await import('@/sheets/assets/kwill.svg?raw');
    const scripts = await import('@/sheets/assets/scripts.js?raw');
    const stylesCss = await import('@/sheets/assets/styles.css?raw');

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

const sheetCharacter = computed(() => {
    return sheetRef.value?.character;
});

// Exports the current state of the sheet to json
function exportCharacter() {
    const characterToExport = sheetRef.value.getCharacterData();

    if (!characterToExport || !characterToExport.name) {
        alert('No character data to export');
        return;
    }

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
}

</script>