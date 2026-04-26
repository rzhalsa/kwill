<template>

    <div class="page-wrapper" id="character-sheet">

        <!-- Page 1 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">
            <div class="page-top-row">
                <input v-model="character.name" placeholder="Character name" autocomplete="off"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">
                <div class="page-top-col">
                    <div>
                        <div style="display: flex; flex-direction: row; align-items: center; gap: 0px;">
                            <input class="page1-top-input-value" v-model="character.classes.firstclass.name"
                                placeholder="class" autocomplete="off" style="width: 70px; margin-top: 30px;">
                            <input class="character-level" v-model="character.classes.firstclass.level" placeholder="1"
                                autocomplete="off"
                                style="position: absolute; width: 33px; height: 25px; margin-left: 75px; margin-top: 30px;"
                                max="20" min="0" type="number">
                        </div>
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.race.name" placeholder="race"
                            autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.alignment" placeholder="allignment"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.background.name"
                            placeholder="background" autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.player" placeholder="player"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.exp" placeholder="exp"
                            autocomplete="off">
                    </div>
                </div>
            </div>

            <!-- Page 1 body -->
            <div class="row" style="justify-content: center; align-items: flex-start; gap: 20px; padding: 10px;">
                <!-- Left Column -->
                <!-- Left Column: Ability Scores + Proficiencies -->
                <div
                    style="display: flex; flex-direction: row; align-items: flex-start; gap: 0px; flex: 0 0 auto; margin-left: -20px;">
                    <!-- Stat boxes -->
                    <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">

                        <div class="stat-box mt-1" v-for="key in abilityList">
                            <div class="col">
                                <span data-label style="font-size: 11px; font-weight: bold;">{{
                                    key.label.toUpperCase()}}</span>
                                <input class="ability-modifier" type="text" :value="key.mod" readonly>
                                <input class="ability-score" type="number" v-model="character.ability[key.name].score">
                            </div>
                        </div>
                    </div>
                    <!-- Proficiency boxes -->
                    <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-start; ">
                        <div class="proficiency-box" v-for="ability in abilityList">
                            <div data-label style="text-align: center; font-weight: bold; margin-bottom: 5px;">
                                {{ ability.name.toUpperCase() }}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
                                <!-- Saving Throw -->
                                <div class="skill-row">
                                    <input type="checkbox" v-model="character.saves[ability.name].proficiency">
                                    <input class="line-input" type="number"
                                        v-model="character.saves[ability.name].modifier" readonly>
                                    <span data-label>saves</span>
                                </div>
                                <!-- Skills -->
                                <div class="skill-row" v-for="skill in groupedSkills[ability.name]">
                                    <input type="checkbox" v-model="character.skills[skill.name].proficiency">
                                    <input class="line-input" type="number"
                                        v-model="character.skills[skill.name].modifier" readonly>
                                    <span data-label>{{ skill.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Middle Column -->
                <div class="col" style="flex: 0 0 auto;">
                    <div class="col">
                        <!-- AC Initiative Speed -->
                        <div class="row">
                            <div>
                                <input v-model="character.ac" autocomplete="off"
                                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                                    style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin: 5px; text-align: center;">
                                <div style="text-align: center;" data-label>AC</div>
                            </div>
                            <div>
                                <input v-model="character.initiative" autocomplete="off" type="text" inputmode="numeric"
                                    oninput="this.value=this.value.replace(/[^0-9+\-]/g,'').replace(/(?!^)[+\-]/g,'')"
                                    style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin: 5px; text-align: center;">
                                <div style="text-align: center;" data-label>Initiative</div>
                            </div>
                            <div>
                                <input v-model="character.speed" autocomplete="off"
                                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                                    style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin: 5px; text-align: center;">
                                <div style="text-align: center;" data-label>Speed</div>
                            </div>
                        </div>
                        <!-- HP, Hit Dice, Death Saves -->
                        <div
                            style="width: 200px; height: 100px; border: 2px solid #000; display: flex; margin: -3px; margin-top: -10px;">
                            <div style="text-align: center;" data-label>Current Hitpoints:
                                <div>
                                    <input v-model="character.hitpoints.current" type="number" autocomplete="off"
                                        style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin-left: 20px; text-align: center;">
                                </div>
                            </div>
                            <div style="text-align: center;" data-label>Hitpoint Maximum:
                                <div>
                                    <input v-model="character.hitpoints.maximum" autocomplete="off" type="number"
                                        style="width: 50px; height: 50px; border: 2px solid #000; display: flex; margin-left: 25px; text-align: center;">
                                </div>
                            </div>
                        </div>
                        <div style="position: relative; width: 200px; align-items: center; margin-left: -6px;">
                            <span
                                style="position: absolute; top: 2px; left: 48px; background: white; padding: 0 4px; font-size: 12px; text-align: center;"
                                data-label> Temporary Hitpoints
                            </span>

                            <input v-model="character.hitpoints.temporary" autocomplete="off" type="number" class="pt-4"
                                style="width: 100%; height: 40px; border: 2px solid #000; text-align: center; text-anchor: middle;">
                        </div>

                        <div class="row">
                            <div class="col"
                                style="width: 120px; height: 65px; border: 2px solid #000; display: flex; flex-direction: column; margin-right: 5px; text-align: center; margin-bottom: 15px;">
                                <span data-label>Hit Dice</span>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 7px; margin-top: -10px;">
                                    <span data-label>Total:</span>
                                    <input type="text" v-model="character.hitDice.total" style="width: 40px;">
                                </div>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 0px; margin-top: -10px; margin-left: -10px;">
                                    <span data-label>Current:</span>
                                    <input type="text" v-model="character.hitDice.current" style="width: 40px;">
                                </div>
                            </div>

                            <div class="col"
                                style="width: 120px; height: 65px; border: 2px solid #000; display: flex; flex-direction: column; align-items: center; margin-left: 5px; text-align: center;">
                                <span data-label>Death Saves</span>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 3px; margin-top: -10px;">
                                    <span data-label>✓</span>
                                    <input type="checkbox" v-model="character.death.saves.success1">
                                    <input type="checkbox" v-model="character.death.saves.success2">
                                    <input type="checkbox" v-model="character.death.saves.success3">
                                </div>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 3px; margin-top: -10px;">
                                    <span data-label>✗</span>
                                    <input type="checkbox" v-model="character.death.saves.failure1">
                                    <input type="checkbox" v-model="character.death.saves.failure2">
                                    <input type="checkbox" v-model="character.death.saves.failure3">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <textarea v-model="character.attacks" placeholder="Attacks and Spellcasting"
                            style="width: 200px; height: 125px; border: 2px solid #000; display: flex; margin-top: -30px; text-align: left; margin-bottom: 5px; resize: none;"></textarea>
                        <div class="row">
                            <div class="col" style="margin-top: 8px; margin-right: 5px;">
                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Cp</span>
                                <input class="money-pieces" v-model="character.coins.copper" type="number"
                                    autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Sp</span>
                                <input class="money-pieces" v-model="character.coins.silver" type="number"
                                    autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Ep</span>
                                <input class="money-pieces" v-model="character.coins.electrum" type="number"
                                    autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Gp</span>
                                <input class="money-pieces" v-model="character.coins.gold" type="number"
                                    autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label="">Pp</span>
                                <input class="money-pieces" v-model="character.coins.platinum" type="number"
                                    autocomplete="off">

                            </div>
                            <textarea v-model="character.equipment.text" placeholder="Equipment"
                                style="width: 160px; height: 270px; border: 2px solid #000; display: flex; text-align: left; resize: none;"></textarea>
                        </div>

                    </div>
                </div>
                <!-- Right Column -->
                <div class="col" style="flex: 0 0 auto; gap: 10px; align-items: flex-start;">
                    <textarea v-model="character.text.personality" placeholder="Personality"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea v-model="character.text.ideals" placeholder="Ideals"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea v-model="character.text.bonds" placeholder="Bonds"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea v-model="character.text.flaws" placeholder="Flaws"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea v-model="character.text.features" placeholder="Features"
                        style="height: 407px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                </div>
            </div>
        </div>

        <!-- Page 2 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">

            <div class="page-top-row">
                <input v-model="character.name" placeholder="Character name here"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">

                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.age" placeholder="age"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.eyes" placeholder="eyes"
                            autocomplete="off">
                    </div>
                </div>

                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.height" placeholder="height"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.skin" placeholder="skin"
                            autocomplete="off">
                    </div>
                </div>

                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.weight" placeholder="weight"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.hair" placeholder="hair"
                            autocomplete="off">
                    </div>
                </div>
            </div>
            <!-- Page 2 body -->
            <div class="row" style="margin-left: -30px;">

                <div class="col">
                    <textarea v-model="character.appearance" placeholder="Appearance"
                        style="height: 260px; width: 200px; border: 2px solid #000; resize: none;"></textarea>

                    <textarea v-model="character.backstory" placeholder="Backstory"
                        style="height: 538px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                </div>

                <div class="col" style="margin-left: -25px;">
                    <textarea v-model="character.alliesAndOrganizations" placeholder="Allies and Organizations"
                        style="height: 260px; width: 500px; border: 2px solid #000; resize: none;"></textarea>

                    <textarea v-model="character.features.additional" placeholder="Aditional Features and Traits"
                        style="height: 260px; width: 500px; border: 2px solid #000; resize: none;"></textarea>

                    <textarea v-model="character.treasure" placeholder="Treasure"
                        style="height: 260px; width: 500px; border: 2px solid #000; resize: none;"></textarea>
                </div>
            </div>

        </div>
        <!-- Page 3 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">


            <div class="page-top-row">
                <input v-model="character.spellcasting.class" placeholder="Spellcasting class"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">

                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.spell.castingAbility"
                            placeholder="spell abi" autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.spell.saveDc"
                            placeholder="spell save dc" autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.spell.attackBonus"
                            placeholder="spell attack bonus" autocomplete="off">
                    </div>
                </div>
            </div>
            <!-- Page 3 body -->
            <!-- Spells -->
            <div class="row">
                <div class="col">
                    <div
                        style="height: 220px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box; gap: 5px;">
                        <span style="text-align: center;" data-label>Cantrips</span>
                        <div class="row" style="gap: 10px;">
                            <!-- Cantrips -->
                            <div class="col">
                                <input v-for="i in character.spells[0].length" :key="i" v-model="character.spells[0][i - 1].name" type="text"
                                    class="line-input">
                            </div>
                            <!--
                            <div class="col">
                                <input v-for="i in 6" :key="i" v-model="character.spells[0][i + 6]" type="text"
                                    class="line-input">
                            </div> -->
                        </div>
                    </div>
                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>1st Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 1 -->
                            <div v-for="i in character.spells[1].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[1][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[1][i - 1].name">
                            </div>
                        </div>
                    </div>
                    <div
                        style="height: 275px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>2nd Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 2 -->
                            <div v-for="i in character.spells[2].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[2][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[2][i - 1].name">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>3rd Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 3 -->
                            <div v-for="(i) in character.spells[3].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[3][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[3][i - 1].name">
                            </div>
                        </div>
                    </div>
                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>4th Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 4 -->
                            <div v-for="i in character.spells[4].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[4][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[4][i - 1].name">
                            </div>
                        </div>
                    </div>
                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>5th Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 5 -->
                            <div v-for="i in character.spells[5].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[5][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[5][i - 1].name">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>6th Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 6 -->
                            <div v-for="i in character.spells[6].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[6][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[6][i - 1].name">
                            </div>
                        </div>
                    </div>
                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>7th Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 7 -->
                            <div v-for="i in character.spells[7].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[7][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[7][i - 1].name">
                            </div>
                        </div>
                    </div>
                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>8th Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 8 -->
                            <div v-for="i in character.spells[8].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[8][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[8][i - 1].name">
                            </div>
                        </div>
                    </div>
                    <div
                        style="height: 200px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>9th Level</span>
                        <div class="row" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                            <!-- Level 9 -->
                            <div v-for="i in character.spells[9].length" :key="i"
                                style="display:flex; align-items:center; gap: 5px; flex:1; min-height: 0;">
                                <input type="checkbox" v-model="character.spells[9][i - 1].prepared">
                                <input type="text" class="line-input" v-model="character.spells[9][i - 1].name">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import {ref, reactive, readonly, computed, watch} from 'vue';
    import { createCharacter, updateCharacter, copyJsonToCharacter } from '../models/characterModel';
    import { debounce } from 'lodash'
    const character = createCharacter();
    const amourBonus = ref(0);
    const changeCount = ref(0);
    const characterId= ref(1);
    const userId = ref(1);
     // ability mapping
    const skillAbilityMap = {
        acrobatics: 'dexterity',
        sleightofhand: 'dexterity',
        stealth: 'dexterity',
        athletics: 'strength',
        arcana: 'intelligence',
        history: 'intelligence',
        investigation: 'intelligence',
        nature: 'intelligence',
        religion: 'intelligence',
        animalhandling: 'wisdom',
        insight: 'wisdom',
        medicine: 'wisdom',
        perception: 'wisdom',
        survival: 'wisdom',
        deception: 'charisma',
        intimidation: 'charisma',
        performance: 'charisma',
        persuasion: 'charisma'
    };
    //labels for stats
    const abilityLabels = {
        strength: "STR",
        dexterity: "DEX",
        constitution: "CON",
        intelligence: "INT",
        wisdom: "WIS",
        charisma: "CHA"
    }
    //returns a computed list used to pull names, labels, values, from reactive character model and calculates ability mod score.
    const abilityList = computed(()=>{
        const list = [];
        for(const key in character.ability){
            //skips over object id fields
            if(key == "object_id") continue;
            const modifier = getAbiltyMod(character.ability[key].score);
            const label = abilityLabels[key];
            //calculates saves mod
            character.saves[key].modifier = modifier + (character.saves[key].proficiency ? proficiencyBonus.value : 0);
            //calculates AC
            if(key == "dexterity")
            {
                character.ac = modifier + 10 + amourBonus.value;
            }
            //populates list
            list.push({
                name:key,
                label:label,
                mod: modifier
            })
        }
        return list;
    });

    /**
     * Gets the ability modifier for score
     * 
     * @param score the score to get the ability modifier of
     */
    function getAbiltyMod(score) {
        return Math.floor((score - 10) / 2);
    }

    //Groups skills and connects skills to abilities
    const groupedSkills = computed(() => {
        const groups = {};
        for (const key in character.skills) {
            if (key === "object_id") continue;
            const abilityType = skillAbilityMap[key];
            if (!groups[abilityType]) {
                groups[abilityType] = [];
            }
            //Calculates skill mod
            const modifier = getAbiltyMod(character.ability[abilityType].score);
            character.skills[key].modifier = modifier + (character.skills[key].proficiency ? proficiencyBonus.value : 0);

            //Populates List
            groups[abilityType].push({
                name: key,
            });
        }
        return groups;
    });

    // proficiency boncus calculation
    const proficiencyBonus = computed(() => {
        const level = parseInt(character.classes.firstclass.level) || 1;
        if (level >= 17) { return 6; }
        if (level >= 13) { return 5; }
        if (level >= 9) { return 4; }
        if (level >= 5) { return 3; }
        return 2;
    });

    function populateSheet(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        
        copyJsonToCharacter(character, data);
    }

    function getCharacterData() {
        return JSON.parse(JSON.stringify(character));
    }

    defineExpose({
        populateSheet,
        getCharacterData
    });

    //Check that prevents API spams with a half second interval incase someone spams three changes quickly
    const debounceUpdate = debounce((newVal)=>{
        updateCharacter(characterId,structuredClone(newVal),userId);
        changeCount.value=0;
    }, 500);

    //watches character model and waits for three changes to be made before calling debounce
    watch(character,(newVal)=>{
        changeCount.value++;
        if(changeCount >= 3){
            debounceUpdate(newVal);
        }
    })
</script>
<style src="../character.css" scoped></style>