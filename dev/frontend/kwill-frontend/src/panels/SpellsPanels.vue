<template>
    <v-card variant="flat" style="overflow-y: auto;">
        <v-card-title class="d-flex justify-center text-subtitle-2">
            <v-btn class="ml-2" color="grey-lighten" size="compact" icon="mdi-import" @click="spellImportHandle()"></v-btn>
            <v-spacer/>
             {{ title }}
            <v-spacer />
            <v-btn class="ml-2" color="primary" size="compact" icon="mdi-plus" v-tooltip="'Add Spell'" @click="addSpell(); "></v-btn>
        </v-card-title>
        <v-card-item v-for="(spell, index) in character.spells[level]" :key="index" class="d-flex flex-column gap-2">
            <v-expansion-panels class="feature-panel" v-model="spell.expanded">
                <v-expansion-panel>
                    <v-expansion-panel-title class="d-flex justify-between align-center">
                        {{ spell.name || 'New '+title+' Spell' }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="panel-expanded" style="flex-direction:column; gap:4px;">
                            <div  style="display:flex; align-items:center; gap:4px;">
                                    <span
                                        style="font-size:11px; color:#555; flex-shrink:0; width:36px;">Name:</span>
                                    <input type="text" id="name_value" placeholder="e.g. Fireball" v-model="spell.name"
                                        style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px; box-sizing:border-box;">
                            </div>
                            <div style="display:flex; align-items:center; gap:4px;">
                                <span style="font-size:11px; color:#555; flex-shrink:0;">School:</span>
                                <select id="school_value" v-model="spell.school"
                                    style="flex:1; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px;">
                                    <option value="">—</option>
                                    <option value="Abjuration">Abjuration</option>
                                    <option value="Conjuration">Conjuration</option>
                                    <option value="Divination">Divination</option>
                                    <option value="Enchantment">Enchantment</option>
                                    <option value="Evocation">Evocation</option>
                                    <option value="Illusion">Illusion</option>
                                    <option value="Necromancy">Necromancy</option>
                                    <option value="Transmutation">Transmutation</option>
                                </select>
                            </div>
                            <div style="display:flex; align-items:center; gap:4px;">
                                <span style="font-size:11px; color:#555; flex-shrink:0;">Action:</span>
                                <select id="action_value" v-model="spell.action"
                                    style="flex:1; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px;">
                                    <option value="">None</option>
                                    <option value="Action">Action</option>
                                    <option value="Bonus">Bonus</option>
                                    <option value="Reaction">Reaction</option>
                                </select>
                            </div>
                            <div style="display:flex; align-items:center; gap:4px;">
                                <span style="font-size:11px; color:#555; flex-shrink:0;">Type:</span>
                                <select id="attacksave_value" v-model="spell.attacksave"
                                    style="width:90px; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px;">
                                    <option value="">—</option>
                                    <option value="Spell Attack">Spell Attack</option>
                                    <option value="Spell Save">Spell Save</option>
                                </select>
                                <span class="attackbonus-display"
                                    style="font-size:11px; color:#555; flex-shrink:0; display:none;"></span>
                                <select id="savetype_value" v-model="spell.savetype"
                                    style="width:42px; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px; display:none;">
                                    <option value="">—</option>
                                    <option value="STR">STR</option>
                                    <option value="DEX">DEX</option>
                                    <option value="CON">CON</option>
                                    <option value="INT">INT</option>
                                    <option value="WIS">WIS</option>
                                    <option value="CHA">CHA</option>
                                </select>
                            </div>
                            <div style="display:flex; align-items:center; gap:4px;">
                                <span style="font-size:11px; color:#555; flex-shrink:0;">Dmg:</span>
                                <input type="text" id="damage_value" placeholder="2d6" v-model="spell.damage"
                                    style="width:40px; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px;">
                                <select id="damagetype_value" v-model="spell.damagetype"
                                    style="width:72px; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px;">
                                    <option value="">—</option>
                                    <option value="Acid">Acid</option>
                                    <option value="Bludgeoning">Bludg.</option>
                                    <option value="Cold">Cold</option>
                                    <option value="Fire">Fire</option>
                                    <option value="Force">Force</option>
                                    <option value="Lightning">Lightn.</option>
                                    <option value="Necrotic">Necro.</option>
                                    <option value="None">None</option>
                                    <option value="Piercing">Pierc.</option>
                                    <option value="Poison">Poison</option>
                                    <option value="Psychic">Psych.</option>
                                    <option value="Radiant">Radiant</option>
                                    <option value="Slashing">Slash.</option>
                                    <option value="Thunder">Thunder</option>
                                </select>
                            </div>
                            <div  style="display:flex; flex-direction:column; gap:4px;">
                                <div  style="display:flex; align-items:center; gap:4px;">
                                    <span
                                        style="font-size:11px; color:#555; flex-shrink:0; width:36px;">Range:</span>
                                    <input type="text" id="range_value" placeholder="e.g. 60ft" v-model="spell.range"
                                        style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px; box-sizing:border-box;">
                                </div>
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span
                                        style="font-size:11px; color:#555; flex-shrink:0; width:36px;">Dur:</span>
                                    <input type="text" id="duration_value" placeholder="e.g. 1 min" v-model="spell.duration"
                                        style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px; box-sizing:border-box;">
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span
                                        style="font-size:11px; color:#555; flex-shrink:0; width:36px;">Shape:</span>
                                    <select id="areashape_value" v-model="spell.areashape"
                                        style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px; box-sizing:border-box;">
                                        <option value="">—</option>
                                        <option value="Cone">Cone</option>
                                        <option value="Sphere">Sphere</option>
                                        <option value="Cube">Cube</option>
                                        <option value="Cylinder">Cylinder</option>
                                        <option value="Line">Line</option>
                                    </select>
                                </div>
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span
                                        style="font-size:11px; color:#555; flex-shrink:0; width:36px;">Size:</span>
                                    <input type="text" id="areasize_value" placeholder="e.g. 30ft" v-model="spell.areasize"
                                        style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; padding:2px; box-sizing:border-box;">
                                </div>
                            </div>
                            <textarea id="description_value" placeholder="Description" v-model="spell.description"
                                style="width:100%; min-height:60px; border:1px solid #8b6914; background:transparent; font-size:12px; font-family:inherit; resize:vertical; box-sizing:border-box; padding:3px;"></textarea>
                            <div style="display:flex; align-items:center; gap:4px;">
                                    <textarea id="formula_value" v-model="spell.formula" placeholder="field operation value" style="flex:1; min-width:0; border:1px solid #8b6914; background:transparent;
                                        font-size:12px; font-family:inherit; padding:2px; resize:height;" rows="1"></textarea>              
                                <input type="checkbox" id="formula_active_value" title="Active" v-model="spell.formula_active"
                                    style="width:14px; height:14px; cursor:pointer; accent-color:#8b6914; flex-shrink:0;">
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label
                                    style="font-size:11px; color:#555; display:flex; align-items:center; gap:3px; cursor:pointer;">
                                    <input type="checkbox" id="showstats_value" v-model="spell.showstats" checked> Stats in tooltip
                                </label>
                                <v-btn color="error" class="ma-2" size="compact" icon="mdi-close" @click.stop="removeSpell(index)"></v-btn>
                            </div>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-item>
        <v-divider></v-divider>
    </v-card>
</template>
<script setup>
import { ref } from 'vue';
import '../sheets/assets/styles.css';
import {useSpellDialogStore} from '../stores/spells_state.js';
const emit = defineEmits(['add-spell', 'remove-spell']);
const spellStore = useSpellDialogStore();

const props = defineProps({
    character: Object,
    spells: Array,
    title: String,
    level: Number
})

function spellImportHandle() {
    spellStore.level = props.level;
    spellStore.showImport = true;
}

function addSpell(){
    const newSpell = {
        level: "0",
        prepared: true,
        name: "",
        school: "",
        action: "",
        attacksave: "",
        savetype: "",
        damage: "",
        damagetype: "",
        range: "",
        duration: "",
        areashape: "",
        areasize: "",
        tooltip: "",
        description: "",
        formula: "",
        formula_active: false,
        showstats: true

    };
    emit('add-spell', props.level, newSpell);
}

function removeSpell(index) {
    emit('remove-spell', props.level, index);
}
</script>
<style scoped>
.panel-expanded {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}

/* Fix ALL inputs */
.panel-expanded input,
.panel-expanded select,
.panel-expanded textarea {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    min-width: 0;
    margin-bottom: 2px;
}

/* Fix flex children overflow */
.panel-expanded * {
    min-width: 0;
}

/* Reduce Vuetify internal padding */
.v-expansion-panel :deep(.v-expansion-panel-text__wrapper) {
    padding: 8px 0 !important;
}

/* Fix title spacing */
.v-expansion-panel :deep(.v-expansion-panel-title) {
    padding: 4px 16px !important;
    min-height: 32px !important;
}
</style>