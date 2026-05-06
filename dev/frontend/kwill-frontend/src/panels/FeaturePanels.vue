<template>
    <v-card variant="flat" style="overflow-y: auto;" theme="light">
        <v-card-title class="d-flex justify-center text-subtitle-2">
            <v-btn class="ml-2" color="grey-lighten" size="compact" icon="mdi-import" @click="spellStore.showFeatImport = true"></v-btn>
            <v-spacer/>
            Features
            <v-spacer />
            <v-btn class="ml-2" color="#e66c63" size="compact" icon="mdi-plus" @click="addFeature"></v-btn>
        </v-card-title>
        <v-card-item v-for="(feature, index) in character.panels.features" :key="index" class="d-flex flex-column gap-2">
            <v-expansion-panels class="feature-panel" v-model="feature.expanded">
                <v-expansion-panel>
                    <v-expansion-panel-title class="d-flex justify-between align-center">
                        {{ feature.name || 'New Feature' }}
                        
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="panel-expanded" style="flex-direction:column; gap:4px;">
                                <div class="mb-1" style="display:flex; align-items:center; gap:4px;">
                                        <input v-model="feature.name" type="text" id="name_value" placeholder="Feature name" style="flex:1; min-width:0; border:none; background:transparent;font-size:13px; outline:none; font-family:inherit;">         
                                </div>
                                <!-- Action type + Level -->
                                <div class="mb-1" style="display:flex; align-items:center; gap:4px;">
                                    <span  style="font-size:11px; color:#555; flex-shrink:0;">Lvl:</span>
                                    <input  v-model="feature.level" type="number" id="level_value" placeholder="—" style="width:28px; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; text-align:center; padding:2px;">
                                    <span  style="font-size:11px; color:#555; flex-shrink:0;">Action:</span>
                                    <select  v-model="feature.action" id="action_value" style="flex:1; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px;">
                                        <option value="None">None</option>
                                        <option value="Action">Action</option>
                                        <option value="Bonus">Bonus</option>
                                        <option value="Reaction">Reaction</option>
                                        <option value="Movement">Movement</option>
                                        <option value="Constant">Constant</option>

                                    </select>
                                </div>

                                <!-- Uses row -->
                                <div class="mb-1" style="display:flex; align-items:center; gap:4px;">
                                    <span style="font-size:11px; color:#555;">Uses:</span>
                                    <input v-model="feature.usesCurrent" type="number" id="uses_current_value" placeholder="0" style="width:40px; border:1px solid #8b6914; background:transparent;font-size:12px; font-family:inherit; text-align:center; padding:2px;">
                                    <span style="font-size:11px; color:#555;">Max:</span>
                                    <input v-model="feature.usesMax" type="number" id="uses_max_value" placeholder="0" style="width:40px; border:1px solid #8b6914; background:transparent;font-size:12px; font-family:inherit; text-align:center; padding:2px;">
                                </div>

                                <!-- Restore -->
                                <div class="mb-1" style="display:flex; align-items:center; gap:4px;">
                                    <span style="font-size:11px; color:#555; flex-shrink:0;">Restore:</span>
                                    <select v-model="feature.restore" id="restore_value" style="flex:1; border:1px solid #8b6914; background:transparent;font-size:12px; font-family:inherit; padding:2px;">
                                        <option value="Long Rest">Long Rest</option>
                                        <option value="Short Rest">Short Rest</option>
                                        <option value="Daily">Daily</option>
                                        <option value="At Will">At Will</option>
                                        <option value="Per Turn">Per Turn</option>
                                        <option value="Per Round">Per Round</option>
                                    </select>
                                </div>
                                <!-- Description -->
                                <textarea v-model="feature.description" id="description_value" placeholder="Description"
                                    style="width:100%; min-height:60px; border:1px solid #8b6914; background:transparent;font-size:12px; font-family:inherit; resize:vertical; box-sizing:border-box; padding:3px;"></textarea>

                                <!-- Formula override -->
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <textarea v-model="feature.formula" id="formula_value" placeholder="field operation value" style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent;
                                            font-size:12px; font-family:inherit; padding:2px; resize:height;" rows="1"></textarea>
                                    <input v-model="feature.formulaActive" type="checkbox" id="formula_active_value" checked>
                                </div>
                        <v-btn color="error" class="mt-2 mb-n3" size="compact" icon="mdi-close" @click.stop="removeFeature(index)"></v-btn>
                    </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-item>
        <v-divider></v-divider>
    </v-card>
</template>
<script setup>
import { ref, watch } from 'vue';
import {useSpellDialogStore} from '../stores/spells_state.js';
import '../sheets/assets/styles.css';
import api from '../services/api';
const emit = defineEmits(['add-feature'], ['remove-feature']);
const spellStore = useSpellDialogStore();
defineProps({
    character: {
        type: Object
    }
})

function addFeature(){
    const newFeature = {
        name: '',
        level: '',
        action: '',
        uses_current: '',
        uses_max: '',
        restore: '',
        tooltip: '',
        description: '',
        formula: '',
        formula_active: false
    };
    emit('add-feature', newFeature);
}

async function fetchFeatureData() {
    try {
        const response = await api.get(`/api/srd/features`)
        spellStore.features = response.data;
        console.log(`Fetched feature data:`, response.data);
    } catch (error) {
        console.error(`Failed to fetch feature data:`, error);
        throw error;
    }
}
watch(() => spellStore.showFeatImport, 
    (open) => {
    if (open) {
        fetchFeatureData();
    }
});

function removeFeature(index) {
    emit('remove-feature', index);
}
</script>
<style scoped>
.v-expansion-panel :deep(.v-expansion-panel-title) {
    padding: 4px 24px !important;
    min-height: 32px !important;
}
</style>