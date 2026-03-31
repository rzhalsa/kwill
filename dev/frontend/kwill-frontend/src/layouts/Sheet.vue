
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
                            <input class="page1-top-input-value" v-model="character.class.name" placeholder="class" autocomplete="off"
                                style="width: 70px; margin-top: 30px;">
                            <input class="character-level" v-model="character.class.level" placeholder="1" autocomplete="off"
                                style="position: absolute; width: 33px; height: 25px; margin-left: 75px; margin-top: 30px;" max="20" min="0"
                                type="number">
                        </div>
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.race.name" placeholder="race" autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.alignment" placeholder="allignment"
                            autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.background.name" placeholder="background"
                            autocomplete="off">
                    </div>
                </div>
                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" v-model="character.player" placeholder="player" autocomplete="off">
                    </div>
                    <div>
                        <input class="page1-top-input-value" v-model="character.exp" placeholder="exp" autocomplete="off">
                    </div>
                </div>
            </div>


            <!-- Page 1 body -->
            <div class="row" style="justify-content: center; align-items: flex-start; gap: 20px; padding: 10px;">
                <!-- Left Column -->
                <!-- Left Column: Ability Scores + Proficiencies -->
                <div style="display: flex; flex-direction: row; align-items: flex-start; gap: 0px; flex: 0 0 auto; margin-left: -20px;">
                    <!-- Stat boxes -->
                    <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">

                        <div class="stat-box mt-1" v-for="ability in abilitiesList" :key="ability.name">
                            <div class="col">
                                <span data-label style="font-size: 11px; font-weight: bold;">
                                {{ ability.label.toUpperCase() }}
                                </span>
                                <input
                                class="ability-modifier"
                                type="text"
                                :value="abilityModifiers[ability.name]"
                                readonly>
                                <input
                                class="ability-score"
                                type="number"
                                v-model.number="abilities[ability.name]">
                            </div>
                        </div>
                    </div>

                <!-- Proficiency boxes -->
                <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-start; ">
                    <div
                        class="proficiency-box"
                        v-for="ability in abilitiesList"
                        :key="ability.name">
                        <div data-label style="text-align: center; font-weight: bold; margin-bottom: 5px;">
                            {{ ability.label }}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
                            <!-- Saving Throw -->
                            <div class="skill-row">
                                <input type="checkbox" v-model="saves[ability.name].proficient">
                                <input class="line-input" type="number" :value="calculatedSaves[ability.name]" readonly>
                                <span data-label>Saves</span>
                            </div>
                            <!-- Skills -->
                            <div class="skill-row" v-for="skill in ability.skills" :key="skill.name">
                                <input type="checkbox" v-model="skills[skill.name].proficient">
                                <input class="line-input" type="number" :value="calculatedSkills[skill.name]" readonly>
                                <span data-label>{{ skill.label }}</span>
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
                        <div style="width: 200px; height: 100px; border: 2px solid #000; display: flex; margin: -3px; margin-top: -10px;">
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
                                    <input type="text" v-model="character.hitDice.curremt" style="width: 40px;">
                                </div>
                            </div>

                            <div class="col"
                                style="width: 120px; height: 65px; border: 2px solid #000; display: flex; flex-direction: column; align-items: center; margin-left: 5px; text-align: center;">
                                <span data-label>Death Saves</span>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 3px; margin-top: -10px;">
                                    <span data-label>✓</span>
                                    <input type="checkbox" v-model="character.death.success1">
                                    <input type="checkbox" v-model="character.death.success2">
                                    <input type="checkbox" v-model="character.death.success3">
                                </div>
                                <div
                                    style="display: flex; flex-direction: row; align-items: center; gap: 3px; margin-top: -10px;">
                                    <span data-label>✗</span>
                                    <input type="checkbox" v-model="character.death.failure1">
                                    <input type="checkbox" v-model="character.death.failure2">
                                    <input type="checkbox" v-model="character.death.failure3">
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
                                <input class="money-pieces" v-model="character.coins.copper" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Sp</span>
                                <input class="money-pieces" v-model="character.coins.silver" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Ep</span>
                                <input class="money-pieces" v-model="character.coins.electrum" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label>Gp</span>
                                <input class="money-pieces" v-model="character.coins.gold" type="number" autocomplete="off">

                                <span style="margin-top: -10px; margin-bottom: -2px;" data-label="">Pp</span>
                                <input class="money-pieces" v-model="character.coins.platinum" type="number" autocomplete="off">

                            </div>
                            <textarea v-model="character.equipment" placeholder="Equipment"
                                style="width: 160px; height: 270px; border: 2px solid #000; display: flex; text-align: left; resize: none;"></textarea>
                        </div>

                    </div>
                </div>


                <!-- Right Column -->
                <div class="col" style="flex: 0 0 auto; gap: 10px; align-items: flex-start;">
                    <textarea id="text_personality_value" placeholder="Personality"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea id="text_ideals_value" placeholder="Ideals"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea id="text_bonds_value" placeholder="Bonds"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea id="text_flaws_value" placeholder="Flaws"
                        style="height: 75px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                    <textarea id="text_features_value" placeholder="Features"
                        style="height: 407px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
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
                        style="height: 260px; width: 200px; border: 2px solid #000; resize: none;"></textarea>

                    <textarea id="backstory_value" placeholder="Backstory"
                        style="height: 538px; width: 200px; border: 2px solid #000; resize: none;"></textarea>
                </div>

                <div class="col" style="margin-left: -25px;">
                    <textarea id="alliesAndOrganizations_value" placeholder="Allies and Organizations"
                        style="height: 260px; width: 500px; border: 2px solid #000; resize: none;"></textarea>

                    <textarea id="features_aditional_value" placeholder="Aditional Features and Traits"
                        style="height: 260px; width: 500px; border: 2px solid #000; resize: none;"></textarea>

                    <textarea id="treasure_value" placeholder="Treasure"
                        style="height: 260px; width: 500px; border: 2px solid #000; resize: none;"></textarea>
                </div>
            </div>

        </div>
        <!-- Page 3 -->
        <div class="page">
            <img class="kwill-logo" src="../assets/icon.png" alt="Kwill Logo" width="300" height="300">


            <div class="page-top-row">
                <input id="spellcasting_class_value" placeholder="Spellcasting class"
                    style="position: absolute; font-size: 18px; top: 75px; left: 130px; width: 200px; height: 30px; border: 2px solid #000;">

                <div class="page-top-col">
                    <div>
                        <input class="page1-top-input-value" id="spell_castingAbility_value" placeholder="spell abi"
                            autocomplete="off">
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
            <!-- Spells -->
            <div class="row">

                <div class="col">
                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box; gap: 5px;">

                        <span style="text-align: center;" data-label>Cantrips</span>
                        <div class="row" style="gap: 10px;">
                            <div class="col">
                                <input id="spells_cantrip1_value" type="text" class="line-input">
                                <input id="spells_cantrip2_value" type="text" class="line-input">
                                <input id="spells_cantrip3_value" type="text" class="line-input">
                                <input id="spells_cantrip4_value" type="text" class="line-input">
                                <input id="spells_cantrip5_value" type="text" class="line-input">
                                <input id="spells_cantrip6_value" type="text" class="line-input">
                            </div>
                            <div class="col">
                                <input id="spells_cantrip7_value" type="text" class="line-input">
                                <input id="spells_cantrip8_value" type="text" class="line-input">
                                <input id="spells_cantrip9_value" type="text" class="line-input">
                                <input id="spells_cantrip10_value" type="text" class="line-input">
                                <input id="spells_cantrip11_value" type="text" class="line-input">
                                <input id="spells_cantrip12_value" type="text" class="line-input">
                            </div>
                        </div>

                    </div>


                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>1st Level</span>
                        <div class="row" style="gap: 5px; align-items: flex-start;">
                            <div class="col" style="flex: 0 0 auto;">
                                <input type="checkbox" id="spells_1st_prepared1_value">
                                <input type="checkbox" id="spells_1st_prepared2_value">
                                <input type="checkbox" id="spells_1st_prepared3_value">
                                <input type="checkbox" id="spells_1st_prepared4_value">
                                <input type="checkbox" id="spells_1st_prepared5_value">
                                <input type="checkbox" id="spells_1st_prepared6_value">
                                <input type="checkbox" id="spells_1st_prepared7_value">
                                <input type="checkbox" id="spells_1st_prepared8_value">
                                <input type="checkbox" id="spells_1st_prepared9_value">
                            </div>
                            <div class="col" style="flex: 1;">
                                <input type="text" class="line-input" id="spells_1st_spell1_value">
                                <input type="text" class="line-input" id="spells_1st_spell2_value">
                                <input type="text" class="line-input" id="spells_1st_spell3_value">
                                <input type="text" class="line-input" id="spells_1st_spell4_value">
                                <input type="text" class="line-input" id="spells_1st_spell5_value">
                                <input type="text" class="line-input" id="spells_1st_spell6_value">
                                <input type="text" class="line-input" id="spells_1st_spell7_value">
                                <input type="text" class="line-input" id="spells_1st_spell8_value">
                                <input type="text" class="line-input" id="spells_1st_spell9_value">
                            </div>
                        </div>
                    </div>

                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>2nd Level</span>
                        <div class="row" style="gap: 5px; align-items: flex-start;">
                            <div class="col" style="flex: 0 0 auto;">
                                <input type="checkbox" id="spells_2nd_prepared1_value">
                                <input type="checkbox" id="spells_2nd_prepared2_value">
                                <input type="checkbox" id="spells_2nd_prepared3_value">
                                <input type="checkbox" id="spells_2nd_prepared4_value">
                                <input type="checkbox" id="spells_2nd_prepared5_value">
                                <input type="checkbox" id="spells_2nd_prepared6_value">
                                <input type="checkbox" id="spells_2nd_prepared7_value">
                                <input type="checkbox" id="spells_2nd_prepared8_value">
                                <input type="checkbox" id="spells_2nd_prepared9_value">
                            </div>
                            <div class="col" style="flex: 1;">
                                <input type="text" class="line-input" id="spells_2nd_spell1_value">
                                <input type="text" class="line-input" id="spells_2nd_spell2_value">
                                <input type="text" class="line-input" id="spells_2nd_spell3_value">
                                <input type="text" class="line-input" id="spells_2nd_spell4_value">
                                <input type="text" class="line-input" id="spells_2nd_spell5_value">
                                <input type="text" class="line-input" id="spells_2nd_spell6_value">
                                <input type="text" class="line-input" id="spells_2nd_spell7_value">
                                <input type="text" class="line-input" id="spells_2nd_spell8_value">
                                <input type="text" class="line-input" id="spells_2nd_spell9_value">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>3rd Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_3rd_prepared1_value">
                                <input type="checkbox" id="spells_3rd_prepared2_value">
                                <input type="checkbox" id="spells_3rd_prepared3_value">
                                <input type="checkbox" id="spells_3rd_prepared4_value">
                                <input type="checkbox" id="spells_3rd_prepared5_value">
                                <input type="checkbox" id="spells_3rd_prepared6_value">
                                <input type="checkbox" id="spells_3rd_prepared7_value">
                                <input type="checkbox" id="spells_3rd_prepared8_value">
                                <input type="checkbox" id="spells_3rd_prepared9_value">
                                <input type="checkbox" id="spells_3rd_prepared10_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_3rd_spell1_value">
                                <input type="text" class="line-input" id="spells_3rd_spell2_value">
                                <input type="text" class="line-input" id="spells_3rd_spell3_value">
                                <input type="text" class="line-input" id="spells_3rd_spell4_value">
                                <input type="text" class="line-input" id="spells_3rd_spell5_value">
                                <input type="text" class="line-input" id="spells_3rd_spell6_value">
                                <input type="text" class="line-input" id="spells_3rd_spell7_value">
                                <input type="text" class="line-input" id="spells_3rd_spell8_value">
                                <input type="text" class="line-input" id="spells_3rd_spell9_value">
                                <input type="text" class="line-input" id="spells_3rd_spell10_value">
                            </div>
                        </div>
                    </div>

                    <div
                        style="height: 300px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>4th Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_4th_prepared1_value">
                                <input type="checkbox" id="spells_4th_prepared2_value">
                                <input type="checkbox" id="spells_4th_prepared3_value">
                                <input type="checkbox" id="spells_4th_prepared4_value">
                                <input type="checkbox" id="spells_4th_prepared5_value">
                                <input type="checkbox" id="spells_4th_prepared6_value">
                                <input type="checkbox" id="spells_4th_prepared7_value">
                                <input type="checkbox" id="spells_4th_prepared8_value">
                                <input type="checkbox" id="spells_4th_prepared9_value">
                                <input type="checkbox" id="spells_4th_prepared10_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_4th_spell1_value">
                                <input type="text" class="line-input" id="spells_4th_spell2_value">
                                <input type="text" class="line-input" id="spells_4th_spell3_value">
                                <input type="text" class="line-input" id="spells_4th_spell4_value">
                                <input type="text" class="line-input" id="spells_4th_spell5_value">
                                <input type="text" class="line-input" id="spells_4th_spell6_value">
                                <input type="text" class="line-input" id="spells_4th_spell7_value">
                                <input type="text" class="line-input" id="spells_4th_spell8_value">
                                <input type="text" class="line-input" id="spells_4th_spell9_value">
                                <input type="text" class="line-input" id="spells_4th_spell10_value">
                            </div>
                        </div>
                    </div>

                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>5th Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_5th_prepared1_value">
                                <input type="checkbox" id="spells_5th_prepared2_value">
                                <input type="checkbox" id="spells_5th_prepared3_value">
                                <input type="checkbox" id="spells_5th_prepared4_value">
                                <input type="checkbox" id="spells_5th_prepared5_value">
                                <input type="checkbox" id="spells_5th_prepared6_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_5th_spell1_value">
                                <input type="text" class="line-input" id="spells_5th_spell2_value">
                                <input type="text" class="line-input" id="spells_5th_spell3_value">
                                <input type="text" class="line-input" id="spells_5th_spell4_value">
                                <input type="text" class="line-input" id="spells_5th_spell5_value">
                                <input type="text" class="line-input" id="spells_5th_spell6_value">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>6th Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_6th_prepared1_value">
                                <input type="checkbox" id="spells_6th_prepared2_value">
                                <input type="checkbox" id="spells_6th_prepared3_value">
                                <input type="checkbox" id="spells_6th_prepared4_value">
                                <input type="checkbox" id="spells_6th_prepared5_value">
                                <input type="checkbox" id="spells_6th_prepared6_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_6th_spell1_value">
                                <input type="text" class="line-input" id="spells_6th_spell2_value">
                                <input type="text" class="line-input" id="spells_6th_spell3_value">
                                <input type="text" class="line-input" id="spells_6th_spell4_value">
                                <input type="text" class="line-input" id="spells_6th_spell5_value">
                                <input type="text" class="line-input" id="spells_6th_spell6_value">
                            </div>
                        </div>
                    </div>

                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>7th Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_7th_prepared1_value">
                                <input type="checkbox" id="spells_7th_prepared2_value">
                                <input type="checkbox" id="spells_7th_prepared3_value">
                                <input type="checkbox" id="spells_7th_prepared4_value">
                                <input type="checkbox" id="spells_7th_prepared5_value">
                                <input type="checkbox" id="spells_7th_prepared6_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_7th_spell1_value">
                                <input type="text" class="line-input" id="spells_7th_spell2_value">
                                <input type="text" class="line-input" id="spells_7th_spell3_value">
                                <input type="text" class="line-input" id="spells_7th_spell4_value">
                                <input type="text" class="line-input" id="spells_7th_spell5_value">
                                <input type="text" class="line-input" id="spells_7th_spell6_value">
                            </div>
                        </div>
                    </div>

                    <div
                        style="height: 195px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>8th Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_8th_prepared1_value">
                                <input type="checkbox" id="spells_8th_prepared2_value">
                                <input type="checkbox" id="spells_8th_prepared3_value">
                                <input type="checkbox" id="spells_8th_prepared4_value">
                                <input type="checkbox" id="spells_8th_prepared5_value">
                                <input type="checkbox" id="spells_8th_prepared6_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_8th_spell1_value">
                                <input type="text" class="line-input" id="spells_8th_spell2_value">
                                <input type="text" class="line-input" id="spells_8th_spell3_value">
                                <input type="text" class="line-input" id="spells_8th_spell4_value">
                                <input type="text" class="line-input" id="spells_8th_spell5_value">
                                <input type="text" class="line-input" id="spells_8th_spell6_value">
                            </div>
                        </div>
                    </div>

                    <div
                        style="height: 200px; width: 200px; border: 2px solid #000; display: flex; flex-direction: column; padding: 5px; box-sizing: border-box;">
                        <span style="text-align: center;" data-label>9th Level</span>
                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; flex: 0 0 auto; gap: 5px;">
                                <input type="checkbox" id="spells_9th_prepared1_value">
                                <input type="checkbox" id="spells_9th_prepared2_value">
                                <input type="checkbox" id="spells_9th_prepared3_value">
                                <input type="checkbox" id="spells_9th_prepared4_value">
                                <input type="checkbox" id="spells_9th_prepared5_value">
                                <input type="checkbox" id="spells_9th_prepared6_value">
                            </div>
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <input type="text" class="line-input" id="spells_9th_spell1_value">
                                <input type="text" class="line-input" id="spells_9th_spell2_value">
                                <input type="text" class="line-input" id="spells_9th_spell3_value">
                                <input type="text" class="line-input" id="spells_9th_spell4_value">
                                <input type="text" class="line-input" id="spells_9th_spell5_value">
                                <input type="text" class="line-input" id="spells_9th_spell6_value">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import {ref, reactive, readonly, computed} from 'vue';
    import { createCharacter } from '../models/characterModel';
    const character = createCharacter();
     // ability mapping
    const skillAbilityMap = {
        acrobatics: 'dexterity',
        sleight_of_hand: 'dexterity',
        stealth: 'dexterity',
        athletics: 'strength',
        arcana: 'intelligence',
        history: 'intelligence',
        investigation: 'intelligence',
        nature: 'intelligence',
        religion: 'intelligence',
        animal_handling: 'wisdom',
        insight: 'wisdom',
        medicine: 'wisdom',
        perception: 'wisdom',
        survival: 'wisdom',
        deception: 'charisma',
        intimidation: 'charisma',
        performance: 'charisma',
        persuasion: 'charisma'
    };

    const abilitiesList = [
        { name: 'strength', label: 'STR', skills: 
            [{ name: 'athletics', label: 'Athletics' }] 
        },
        { name: 'dexterity', label: 'DEX', skills: 
        [   { name: 'acrobatics', label: 'Acrobatics' },
            { name: 'sleight_of_hand', label: 'Sleight of Hand' },
            { name: 'stealth', label: 'Stealth' } ]
        },
        { name: 'constitution', label: 'CON', skills: [] 
        },
        { name: 'intelligence', label: 'INT', skills: 
        [   { name: 'arcana', label: 'Arcana' },
            { name: 'history', label: 'History' },
            { name: 'investigation', label: 'Investigation' },
            { name: 'nature', label: 'Nature' },
            { name: 'religion', label: 'Religion' }]
        },
        { name: 'wisdom', label: 'WIS', skills: [
            { name: 'animal_handling', label: 'Animal Handling' },
            { name: 'insight', label: 'Insight' },
            { name: 'medicine', label: 'Medicine' },
            { name: 'perception', label: 'Perception' },
            { name: 'survival', label: 'Survival' }
            ]
        },
        { name: 'charisma', label: 'CHA', skills: [
            { name: 'deception', label: 'Deception' },
            { name: 'intimidation', label: 'Intimidation' },
            { name: 'performance', label: 'Performance' },
            { name: 'persuasion', label: 'Persuasion' }
            ]
        }
    ];

    const abilities = reactive({
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    });

    const saves = reactive({});
    const skills = reactive({});

    // Initialize saves and skills
    abilitiesList.forEach(a => {
        saves[a.name] = { proficient: false };
        a.skills.forEach(s => skills[s.name] = { proficient: false });
    });

    // proficiency boncus calculation
    const proficiencyBonus = computed(() => {
        if(character.class.level>=17){ return 6;}
        if(character.class.level>=13){ return 5;}
        if(character.class.level>=9){ return 4;}
        if(character.class.level>=5){ return 3;}
        return 2;
    });

    // Computed ability modifiers
    const abilityModifiers = computed(() => {
        const result = {};
        for (const key in abilities) {
            result[key] = Math.floor((abilities[key] - 10) / 2);
        }
        return result;
    });

    // Computed Saves
    const calculatedSaves = computed(() => {
        const result = {};
        for (const key in saves) {
            const mod = abilityModifiers.value[key];
            result[key] = mod + (saves[key].proficient ? proficiencyBonus.value : 0);
        }
        return result;
    });

    // Computed Skills
    const calculatedSkills = computed(() => {
        const result = {};
        for (const key in skills) {
            const abilityKey = skillAbilityMap[key];
            const mod = abilityModifiers.value[abilityKey];
            result[key] = mod + (skills[key].proficient ? proficiencyBonus.value : 0);
        }
        return result;
    });

</script>
<style src="../character.css" scoped></style>