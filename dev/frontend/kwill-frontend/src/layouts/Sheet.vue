
<template>
    <div class="isolated_wrapper">
    <div class="toolbar">
        <div class="toolbar-section">

            <!-- ThIS IS FOR LOADING AND SAVING LOCALLY -->

            <input type="file" id="folderInput" style="display: none;" webkitdirectory multiple>
            <label for="folderInput" class="folder-button"
                style="display: inline-block; padding: 5px 8px; background-color: #ffffff; color: black; border: 2px solid #000; margin-left: 20px;"
                onmouseover="this.style.backgroundColor='#000'; this.style.color='#fff';"
                onmouseout="this.style.backgroundColor='#fff'; this.style.color='black';">
                Load Character Folder
            </label>

            <p id="selectedFolder">No folder selected</p>

            <label for="characterSelect">Character:</label>
            <select id="characterSelect">
                <option>Select Character</option>
            </select>

            <button id="saveButton" type="button"
                style="display: inline-block; padding: 5px 8px; background-color: #ffffff; color: black; border: 2px solid #000; margin-left: 20px;"
                onmouseover="this.style.backgroundColor='#000'; this.style.color='#fff';"
                onmouseout="this.style.backgroundColor='#fff'; this.style.color='black';">
                Save Character
            </button>

            <!-- THIS WILL BE DIFFERENT ON THE WEBSITE -->

        </div>

    </div>

    <div class="page-wrapper" id="character-sheet">

        <!-- Page 1 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">

            <div class="page-top-row">
                <input id="name_value" placeholder="Character name here" autocomplete="off"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">
                <div class="page-top-col">

                    <div>
                        <input class="page1-top-input-value" id="class_level_value" placeholder="class & level"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" id="race_name" placeholder="race" autocomplete="off">
                    </div>

                </div>

                <div class="page-top-col">

                    <div>
                        <input class="page1-top-input-value" id="allignment_value" placeholder="allignment"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" id="background_name" placeholder="background"
                            autocomplete="off">
                    </div>

                </div>

                <div class="page-top-col">

                    <div>
                        <input class="page1-top-input-value" id="player_value" placeholder="player" autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" id="exp_value" placeholder="exp" autocomplete="off">
                    </div>

                </div>
            </div>


            <!-- Page 1 body -->
            <div class="row">
                <!-- Left Column -->
                <!-- Ability Scores and Modifiers -->
                <div class="col">

                    <div class="row">
                        <div class="stat-box">
                            <div class="col">
                                <input class="ability-modifier" id="ability_strength_modifier_calculated" type="text"
                                    autocomplete="off"
                                    value="=ability_strength_score [0,3,4,6,8,10,12,14,16,18,20][-5,-4,-3,-2,-1,0,1,2,3,4,5]">
                                <input class="ability-score" id="ability_strength_score_value" type="number"
                                    autocomplete="off">
                            </div>
                        </div>
                        <div class="proficiency-box">
                            <div data-label>Strength</div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="stat-box">
                            <div class="col">
                                <input class="ability-modifier" id="ability_dexterity_modifier_calculated" type="text"
                                    autocomplete="off"
                                    value="=ability_dexterity_score [0,3,4,6,8,10,12,14,16,18,20][-5,-4,-3,-2,-1,0,1,2,3,4,5]">
                                <input class="ability-score" id="ability_dexterity_score_value" type="number"
                                    autocomplete="off">
                            </div>
                        </div>
                        <div class="proficiency-box">
                            <div data-label>Dexterity</div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="stat-box">
                            <div class="col">
                                <input class="ability-modifier" id="ability_constitution_modifier_calculated"
                                    type="text" autocomplete="off"
                                    value="=ability_constitution_score [0,3,4,6,8,10,12,14,16,18,20][-5,-4,-3,-2,-1,0,1,2,3,4,5]">
                                <input class="ability-score" id="ability_constitution_score_value" type="number"
                                    autocomplete="off">
                            </div>
                        </div>
                        <div class="proficiency-box">
                            <div data-label>Constitution</div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="stat-box">
                            <div class="col">
                                <input class="ability-modifier" id="ability_intelligence_modifier_calculated"
                                    type="text" autocomplete="off"
                                    value="=ability_intelligence_score [0,3,4,6,8,10,12,14,16,18,20][-5,-4,-3,-2,-1,0,1,2,3,4,5]">
                                <input class="ability-score" id="ability_intelligence_score_value" type="number"
                                    autocomplete="off">
                            </div>
                        </div>
                        <div class="proficiency-box">
                            <div data-label>Intelligence</div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="stat-box">
                            <div class="col">
                                <input class="ability-modifier" id="ability_wisdom_modifier_calculated" type="text"
                                    autocomplete="off"
                                    value="=ability_wisdom_score [0,3,4,6,8,10,12,14,16,18,20][-5,-4,-3,-2,-1,0,1,2,3,4,5]">
                                <input class="ability-score" id="ability_wisdom_score_value" type="number"
                                    autocomplete="off">
                            </div>
                        </div>
                        <div class="proficiency-box">
                            <div data-label>Wisdom</div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="stat-box">
                            <div class="col">
                                <input class="ability-modifier" id="ability_charisma_modifier_calculated" type="text"
                                    autocomplete="off"
                                    value="=ability_charisma_score [0,3,4,6,8,10,12,14,16,18,20][-5,-4,-3,-2,-1,0,1,2,3,4,5]">
                                <input class="ability-score" id="ability_charisma_score_value" type="number"
                                    autocomplete="off">
                            </div>
                        </div>
                        <div class="proficiency-box">
                            <div data-label>Charisma</div>
                        </div>
                    </div>
                </div>


                <!-- Middle Column -->
                <div class="col">
                    <div class="col">
                        <!-- AC Initiative Speed -->
                        <div class="row">
                            <div> <input id="ac_value" autocomplete="off"
                                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                                    style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin: 5px; text-align: center;">
                                <div style="text-align: center;" data-label>AC</div>
                            </div>
                            <div>
                                <input id="initiative_value" autocomplete="off" type="text" inputmode="numeric"
                                    oninput="this.value=this.value.replace(/[^0-9+\-]/g,'').replace(/(?!^)[+\-]/g,'')"
                                    style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin: 5px; text-align: center;">
                                <div style="text-align: center;" data-label>Initiative</div>
                            </div>
                            <div><input id="speed_value" autocomplete="off"
                                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                                    style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin: 5px; text-align: center;">
                                <div style="text-align: center;" data-label>Speed</div>

                            </div>
                        </div>


                        <!-- HP, Hit Dice, Death Saves -->
                        <div
                            style="width: 200px; height: 100px; border: 2px solid #000; display: flex; margin: -3px; margin-top: -10px;">
                            <div style="text-align: center;" data-label>Current Hitpoints:
                                <div> <input id="hitpoints_current_value" type="number" autocomplete="off"
                                        style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin-left: 20px; text-align: center;">
                                </div>
                            </div>
                            <div style="text-align: center;" data-label>Hitpoint Maximum:
                                <div> <input id="hitpoints_maximum_value" autocomplete="off" type="number"
                                        style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin-left: 25px; text-align: center;">
                                </div>
                            </div>
                        </div>
                        <div style="position: relative; width: 200px; align-items: center; margin-left: -6px;">
                            <span
                                style="position: absolute; top: 2px; left: 48px; background: white; padding: 0 4px; font-size: 12px; text-align: center;"
                                data-label>
                                Temporary Hitpoints
                            </span>

                            <input id="hitpoints_temporary_value" autocomplete="off" type="number"
                                style="width: 100%; height: 40px; border: 2px solid #000; text-align: center; text-anchor: middle;">
                        </div>

                        <div class="row">
                            <div class="col"
                                style="width: 120px; height: 65px; border: 2px solid #000; display: flex; flex-direction: column; margin-right: 5px; text-align: center;">
                                <span data-label>Hit Dice</span>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 7px; margin-top: -10px;">
                                    <span data-label>Total:</span>
                                    <input type="text" id="hitDice_total_value" style="width: 40px;">
                                </div>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 0px; margin-top: -10px; margin-left: -10px;">
                                    <span data-label>Current:</span>
                                    <input type="text" id="hitDice_current_value" style="width: 40px;">
                                </div>
                            </div>

                            <div class="col"
                                style="width: 120px; height: 65px; border: 2px solid #000; display: flex; flex-direction: column; align-items: center; margin-left: 5px; text-align: center;">
                                <span data-label>Death Saves</span>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 3px; margin-top: -10px;">
                                    <span data-label>✓</span>
                                    <input type="checkbox" id="death_saves_success1_value">
                                    <input type="checkbox" id="death_saves_success2_value">
                                    <input type="checkbox" id="death_saves_success3_value">
                                </div>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 3px; margin-top: -10px;">
                                    <span data-label>✗</span>
                                    <input type="checkbox" id="death_saves_failure1_value">
                                    <input type="checkbox" id="death_saves_failure2_value">
                                    <input type="checkbox" id="death_saves_failure3_value">
                                </div>
                            </div>
                        </div>


                    </div>

                    <div class="col">

                        <textarea id="attacks_value" placeholder="Attacks and Spellcasting"
                            style="width: 200px; height: 100px; border: 2px solid #000; display: flex; margin-top: -30px; text-align: left;"></textarea>
                        <div class="row">
                            <div class="col" style="margin-top: 8px; margin-right: 5px;">
                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Cp</span>
                                <input class="money-pieces" id="coins_copper_value" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Sp</span>
                                <input class="money-pieces" id="coins_silver_value" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Ep</span>
                                <input class="money-pieces" id="coins_electrum_value" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Gp</span>
                                <input class="money-pieces" id="coins_gold_value" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label="">Pp</span>
                                <input class="money-pieces" id="coins_gold_value" type="number" autocomplete="off">

                            </div>
                            <textarea id="equipment_value" placeholder="Equipment"
                                style="width: 160px; height: 270px; border: 2px solid #000; display: flex; text-align: left;"></textarea>
                        </div>

                    </div>
                </div>


                <!-- Right Column -->
                <div class="col">
                    <div class="col" style="margin-top: 0px;">
                        <textarea id="text_personality_value" placeholder="Personality"
                            style="height: 60px; width: 200px; border: 2px solid #000;"></textarea>
                        <textarea id="text_ideals_value" placeholder="Ideals"
                            style="height: 60px; width: 200px; border: 2px solid #000;"></textarea>
                        <textarea id="text_bonds_value" placeholder="Bonds"
                            style="height: 60px; width: 200px; border: 2px solid #000;"></textarea>
                        <textarea id="text_flaws_value" placeholder="Flaws"
                            style="height: 60px; width: 200px; border: 2px solid #000;"></textarea>

                    </div>
                    <div class="col">
                        <textarea id="text_features_value" placeholder="Features"
                            style="height: 400px; width: 200px; margin-top: -50px; border: 2px solid #000;"></textarea>
                    </div>
                </div>

            </div>

        </div>




        <!-- Page 2 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">

            <div class="page-top-row">
                <input id="name2_calculated" placeholder="Character name here" value="=>name"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">

                <div class="page-top-col">

                    <div>
                        <input class="page1-top-input-value" id="age_value" placeholder="age" autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" id="eyes_value" placeholder="eyes" autocomplete="off">
                    </div>

                </div>

                <div class="page-top-col">

                    <div>
                        <input class="page1-top-input-value" id="height_value" placeholder="height" autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" id="skin_value" placeholder="skin" autocomplete="off">
                    </div>

                </div>

                <div class="page-top-col">

                    <div>
                        <input class="page1-top-input-value" id="weight_value" placeholder="weight" autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" id="hair_value" placeholder="hair" autocomplete="off">
                    </div>

                </div>
            </div>





            <!-- Page 2 body -->

            <div class="row" style="margin-left: -30px;">

                <div class="col">
                    <textarea id="appearance_value" placeholder="Appearance"
                        style="height: 260px; width: 200px; border: 2px solid #000;"></textarea>

                    <textarea id="backstory_value" placeholder="Backstory"
                        style="height: 538px; width: 200px; border: 2px solid #000;"></textarea>
                </div>

                <div class="col" style="margin-left: -25px;">
                    <textarea id="alliesAndOrganizations_value" placeholder="Allies and Organizations"
                        style="height: 260px; width: 500px; border: 2px solid #000;"></textarea>

                    <textarea id="features_aditional_value" placeholder="Aditional Features and Traits" 
                    style="height: 260px; width: 500px; border: 2px solid #000;"></textarea>

                    <textarea id="treasure_value" placeholder="Treasure"
                    style="height: 260px; width: 500px; border: 2px solid #000;"></textarea>
                </div>
            </div>

        </div>




        <!-- Page 3 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">


            <div class="page-top-row">
                <input id="spellcasting_class_value" placeholder="Spellcasting class here"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">

                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" id="spell_castingAbility_value"
                            placeholder="spell abi" autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" id="spell_saveDc_value" placeholder="spell save dc"
                            autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" id="spell_attackBonus_value"
                            placeholder="spell attack bonus" autocomplete="off">
                    </div>
                </div>
            </div>

            <!-- Page 3 body -->
            <div class="row">

                <div class="col">
                    <div id="" style="height: 195px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 300px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 300px; width: 200px; border: 2px solid #000;"></div>

                </div>


                <div class="col">
                    <div id="" style="height: 300px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 300px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 195px; width: 200px; border: 2px solid #000;"></div>
                </div>


                <div class="col">
                    <div id="" style="height: 195px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 195px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 195px; width: 200px; border: 2px solid #000;"></div>

                    <div id="" style="height: 195px; width: 200px; border: 2px solid #000;"></div>
                </div>


            </div>


        </div>
    </div>
    </div>
</template>
<script setup>
import {ref} from 'vue';
    const charData = ref(null);
    defineExpose({populateSheet});

    function setNested(json, parts, value, overwrite = false) {
        if (parts.length === 1) {
            const existing = json[parts[0]];
            // never overwrite an existing operation with a non-operation
            if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
            if (overwrite || existing === undefined || existing === '') {
                json[parts[0]] = value;
            }
            return;
        }

        const field = parts[parts.length - 1];
        const stat = parts[parts.length - 2];
        const objectId = parts.slice(0, -2).join('_');

        if (!objectId) {
            if (!json[stat]) json[stat] = {};
            const existing = json[stat][field];
            if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
            if (overwrite || existing === undefined || existing === '') {
                json[stat][field] = value;
            }
            return;
        }

        if (!json[objectId]) json[objectId] = { object_id: objectId };
        if (!json[objectId][stat]) json[objectId][stat] = {};

        const existing = json[objectId][stat][field];
        if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
        if (existing !== undefined && existing !== '' && value === '') return;
        if (overwrite || existing === undefined || existing === '') {
            json[objectId][stat][field] = value;
        }
    }


    // Populate the character sheet
    function populateSheet(characterData) {
        if (!characterData) return;

        function setElementValue(el, value) {
            if (!el) return;
            if (el.hasAttribute('data-label')) return;
            const tag = el.tagName.toUpperCase();
            if (tag === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
                el.checked = value === true || value === 'true';
            } else if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
                el.value = value ?? '';
            } else {
                el.textContent = value ?? '';
            }
        }

        function walkObject(obj, parentId = null) {
            if (!obj || typeof obj !== 'object') return;

            let effectiveParent;
            if (parentId === null && obj.object_id === 'character') {
                effectiveParent = null;
            } else {
                effectiveParent = obj.object_id ?? parentId;
            }

            Object.keys(obj).forEach(key => {
                if (key === 'object_id') return;
                const value = obj[key];

                const fullId       = effectiveParent ? `${effectiveParent}_${key}` : key;
                const elCalculated = document.getElementById(`${fullId}_calculated`);
                const elValue      = document.getElementById(`${fullId}_value`);
                const elNormal     = document.getElementById(fullId);

                if (value && typeof value === 'object' && value.object_id === 'operation') {
                    const result = evaluateOperation(value, characterData);
                    if (elCalculated)  setElementValue(elCalculated, result);
                    else if (elValue)  setElementValue(elValue, result);
                    else if (elNormal) setElementValue(elNormal, result);

                } else if (value && typeof value === 'object') {
                    walkObject(value, fullId);

                } else {
                    if (elCalculated)  setElementValue(elCalculated, value);
                    else if (elValue)  setElementValue(elValue, value);
                    else if (elNormal) setElementValue(elNormal, value);
                }
            });
        }

        walkObject(characterData);

        // Second pass: re-evaluate all _calculated fields from their default formula
        document.querySelectorAll('[id$="_calculated"]').forEach(el => {
            if (el.hasAttribute('data-label')) return;
            const formula = el.defaultValue?.trim();
            if (!formula?.startsWith('=')) return;

            const formulaText = formula.slice(1).trim();
            let operationObj;

            if (formulaText.startsWith('>')) {
                operationObj = {
                    object_id: 'operation',
                    operation_type: 'mirror',
                    condition: formulaText.slice(1).trim()
                };
            } else {
                const condMatch = formulaText.match(/^([a-zA-Z_][\w]*)\s*\[([^\]]*)\]\s*\[([^\]]*)\]$/);
                if (condMatch) {
                    const parseList = (str) => str.split(',').map(s => {
                        const t = s.trim();
                        const n = parseFloat(t);
                        return isNaN(n) ? t : n;
                    });
                    operationObj = {
                        object_id: 'operation',
                        operation_type: 'conditional',
                        condition: condMatch[1].trim(),
                        thresholds: parseList(condMatch[2]),
                        results: parseList(condMatch[3])
                    };
                } else {
                    operationObj = {
                        object_id: 'operation',
                        operation_type: '=',
                        value: formulaText
                    };
                }
            }

            el.value = evaluateOperation(operationObj, characterData);
        });
    }



    // Populate the JSON with the names and values in the html sheet.
    function populateJsonFromHtml(existingJson = {}) {
        const container = document.getElementById('character-sheet');
        if (!container) return structuredClone(existingJson);

        const base = existingJson.object_id === 'character'
            ? structuredClone(existingJson)
            : { object_id: 'character', ...structuredClone(existingJson) };

        container.querySelectorAll('[id]').forEach(el => {
            let id = el.id?.trim();
            if (!id) return;

            // Read value based on element type
            let value;
            if (el.type === 'checkbox' || el.type === 'radio') {
                value = el.checked;
            } else {
                value = el.value !== undefined ? el.value : (el.textContent?.trim() ?? '');
            }

            const isCalculated = id.endsWith('_calculated');
            const isValue = id.endsWith('_value');
            const isName = id.endsWith('_name');

            if (isCalculated) id = id.slice(0, -'_calculated'.length);
            else if (isValue) id = id.slice(0, -'_value'.length);
            else if (isName) {
                id = id.slice(0, -'_name'.length);
                if (!base[id]) base[id] = { object_id: id };
                base[id].name = value;
                return;
            }

            if (isCalculated) {
                const trimmed = (value + '').trim();
                if (!trimmed.startsWith('=')) return;

                if (trimmed.startsWith('=>')) {
                    value = {
                        object_id: 'operation',
                        operation_type: 'mirror',
                        condition: trimmed.slice(2).trim()
                    };
                } else {
                    const formulaText = trimmed.slice(1).trim();
                    const condMatch = formulaText.match(/^([a-zA-Z_][\w]*)\s*\[([^\]]*)\]\s*\[([^\]]*)\]$/);

                    if (condMatch) {
                        const parseList = (str) => str.split(',').map(s => {
                            const t = s.trim();
                            const n = parseFloat(t);
                            return isNaN(n) ? t : n;
                        });
                        value = {
                            object_id: 'operation',
                            operation_type: 'conditional',
                            condition: condMatch[1].trim(),
                            thresholds: parseList(condMatch[2]),
                            results: parseList(condMatch[3])
                        };
                    } else {
                        value = {
                            object_id: 'operation',
                            operation_type: '=',
                            value: formulaText
                        };
                    }
                }
            }

            const parts = id.split('_');
            setNested(base, parts, value, isCalculated);
        });

        charData.value = base;
    }

    // Handles oobjects of type operation
    function evaluateOperation(operationObj, jsonData) {
        if (!operationObj || operationObj.object_id !== 'operation') return '';

        function resolveByPath(obj, pathStr) {
            const parts = pathStr.split('_');
            for (let i = parts.length; i >= 1; i--) {
                const key = parts.slice(0, i).join('_');
                const remainder = parts.slice(i);
                if (obj[key] !== undefined) {
                    if (remainder.length === 0) return obj[key];
                    const nested = resolveByPath(obj[key], remainder.join('_'));
                    if (nested !== undefined) return nested;
                }
            }
            return undefined;
        }

        function resolveByKey(obj, key) {
            if (!obj || typeof obj !== 'object') return undefined;
            if (obj[key] !== undefined) return obj[key];
            for (const k in obj) {
                const val = resolveByKey(obj[k], key);
                if (val !== undefined) return val;
            }
            return undefined;
        }

        function resolveVar(name) {
            const clean = name.replace(/_(value|calculated)$/, '');
            let val = resolveByPath(jsonData, clean);
            if (val === undefined) val = resolveByKey(jsonData, clean);
            if (val && typeof val === 'object' && val.object_id === 'operation') {
                val = evaluateOperation(val, jsonData);
            }
            if (val && typeof val === 'object') return 0;
            return (val === undefined || val === '' || val === null) ? 0 : Number(val) || 0;
        }

        function resolveString(name) {
            const clean = name.replace(/_(value|calculated)$/, '');
            let val = resolveByPath(jsonData, clean);
            if (val === undefined) val = resolveByKey(jsonData, clean);
            if (val && typeof val === 'object' && val.object_id === 'operation') {
                val = evaluateOperation(val, jsonData);
            }
            return val ?? '';
        }

        // ── mirror ─────────────────────────────────────────────────────────────
        if (operationObj.operation_type === 'mirror') {
            return resolveString(operationObj.condition);
        }

        // ── conditional ────────────────────────────────────────────────────────
        if (operationObj.operation_type === 'conditional') {
            const condVal = resolveVar(operationObj.condition);
            const thresholds = operationObj.thresholds || [];
            const results = operationObj.results || [];

            let matchIndex = -1;
            for (let i = 0; i < thresholds.length; i++) {
                if (condVal >= parseFloat(thresholds[i])) matchIndex = i;
            }

            return matchIndex === -1 ? '' : (results[matchIndex] ?? '');
        }

        // ── arithmetic ─────────────────────────────────────────────────────────
        const BUILTINS = new Set([
            'Math', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'sqrt', 'pow',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Number', 'String',
            'Boolean', 'true', 'false', 'null', 'undefined', 'Infinity', 'NaN'
        ]);

        let formula = (operationObj.value ?? '').trim();
        if (!formula) return '';

        formula = formula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
            if (BUILTINS.has(match)) return match;
            return resolveVar(match);
        });

        if (/[^0-9a-zA-Z_+\-*/(). \t]/.test(formula)) {
            console.warn('Unsafe characters in formula:', formula);
            return '';
        }

        try {
            return Function(`"use strict"; return (${formula})`)();
        } catch (err) {
            console.warn('Failed to evaluate formula:', formula, err);
            return '';
        }
    }
</script>


<style scoped>
        body {
            background: #e0e0e0;

            flex-direction: column;
            align-items: center;

        }
        .sheet-text,
        .sheet-text input,
        .sheet-text textarea,
        .sheet-text select {
        color: black !important;
        }

        .isolated_wrapper {
            all: unset;
            display: block;       
            position: relative;
           color: black !important;
        }

        .isolated-wrapper * {
            all: unset;            /* reset all children */
            box-sizing: border-box;
            }
        .toolbar {
            width: 100%;
            background: #aaa;
            padding: 10px 20px;
            display: none;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #aaa;
            margin-bottom: 20px;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .toolbar-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toolbar-label {
            font-size: 24px;
            font-weight: bold;
        }


        .kwill-logo {
            position: absolute;
            top: -50px;
            left: 10px;
            pointer-events: none;
        }


        .page-wrapper {
            margin-bottom: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 40px;
        }


        .page {
            position: relative;
            background: #ffffff;
            background-size: cover;
            width: 816px;
            height: 1056px;
            padding: 0px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
            align-items: center;


            /* zoom: 0.65; */
            transform-origin: top center;
        }

        .page-top-row {
            position: relative;
            height: 200px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            gap: 140px;

        }

        .page-top-col {
            position: relative;
            left: 90px;
            margin-bottom: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 35px;

        }

        .page1-top-input-value {
            position: absolute;
            background: #ffffff;
            font-size: 18px;
            width: 100px;
            height: 25px;
            border: 2px solid #000;
        }

        .page1-input-value {
            background: #ffffff;
            font-size: 18px;
            width: 100px;
            height: 25px;
            border: 2px solid #000;
        }


        .stat-box {
            border: 2px solid #000;
            padding: 10px;
            margin-bottom: -15px;
            /* margin-left: 35px; */
            height: 75px;
            width: 60px;
        }

        .ability-score {
            border: 2px solid #000;
            height: 30px;
            width: 30px;
            margin-top: -7px;
            text-align: center;

        }

        .ability-modifier {
            border: 2px solid #000;
            height: 50px;
            width: 50px;
            margin-top: -7px;
            text-align: center;

        }


        .proficiency-box {
            border: 2px solid #000;
            padding: 10px;
            margin-left: 10px;
            height: 75px;
            width: 75px;
        }

        .money-pieces {
            border: 2px solid #000;
            height: 30px;
            width: 45px;
            margin-top: -7px;
            text-align: right;

        }

        .row {
            display: flex;
            margin-bottom: 20px;
            width: 100%;
            justify-content: center;
        }

        .col {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 10px;
            align-items: center;
        }

        .box {
            border: 2px solid #000;
            display: flex;
        }




        @media print {

            body * {
                visibility: hidden;
            }

            .page,
            .page * {
                visibility: visible;
            }

            .page {
                position: static;
                /* <-- FIX: keep it in normal flow */
                box-shadow: none;
                page-break-after: always;
                margin: 0 auto;
                /* center on page */
            }

            .toolbar,
            .toolbar-section,
            .toolbar-label {
                display: none;
            }
        }
    </style>