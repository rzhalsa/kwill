<template>
    <v-card>
        <v-row>
            <v-card-title class="mt-3 ml-3 cc-title">Step 4/8: Skills</v-card-title>
            <v-divider horizontal class="mt-2 mb-6"></v-divider>
            <v-col>
                <p class="ml-3">Select {{ amt }} of the following skills to have proficiency in:</p>
                <div class="skill-area">
                    <v-list>
                        <v-list-item v-for="option in options" :key="option">
                            <v-checkbox :label="option" :model-value="selected_skills.includes(option)" @update:model-value="toggle(option)"></v-checkbox>
                        </v-list-item>
                    </v-list>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { useCharacterCreationStore } from '../stores/character_creation_state'
    const store = useCharacterCreationStore()                                    // pinia store for character creation
    const selected_class = ref(store.getCharacterState.get('class'))             // the player's selected class
    const amt = ref(null)                                                        // max amount of skill proficiencies
    const options = ref([])                                                      // skill proficiency options
    const selected_skills = ref(store.getCharacterState.get('selected_skills'))  // skills the player has selected to have proficiency in
    const skill_data = {
        "Barbarian" : {
            amt: 2,
            options: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
        },
        "Bard": {
            amt: 3,
            options: ["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"],
        },
        "Cleric": {
            amt: 2,
            options: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
        },
        "Druid": {
            amt: 2,
            options: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
        },
        "Fighter": {
            amt: 2,
            options: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
        },
        "Monk": {
            amt: 2,
            options: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
        },
        "Paladin": {
            amt: 2,
            options: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
        },
        "Ranger": {
            amt: 3,
            options: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
        },
        "Rogue": {
            amt: 4,
            options: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
        },
        "Sorcerer": {
            amt: 2,
            options: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
        },
        "Warlock": {
            amt: 2,
            options: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
        },
        "Wizard": {
            amt: 2,
            options: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
        },
    }

    /**
     * Saves currently entered feat data before the page unmounts
     */
    function saveSkillData() {
        store.setCharacterState('selected_skills', selected_skills)
    }

    /**
     * Assigns values to amt and options to reflect the player's chosen class
     */
    function setSkillData() {
        if(selected_class.value in skill_data) {
            amt.value = skill_data[selected_class.value].amt
            options.value = skill_data[selected_class.value].options
        }
    }

    /**
     * Toggles a skill checkbox in the skills dropdown for character creation
     * @param option the skill checkbox to toggle
     */
    function toggle(option) {
        if(selected_skills.value.includes(option)) {
            selected_skills.value = selected_skills.value.filter(o => o != option)
        } else {
            if(selected_skills.value.length < amt.value) {
                selected_skills.value.push(option)
            }
        }
    }

    /**
     * Fetches feat data and populates the feats var with the fetched data
     * on page mount
     */
    onMounted(() => {
        setSkillData()
    })

    /**
     * Calls saveGearData() before the page unmounts
     */
    onBeforeUnmount(() => {
        saveSkillData()
    })
</script>

<style>
    .login-input {
        color: black;
        background-color: white;
        width: 20vw;
    }

    .skill-area {
        height: 400px;        /* or max-height: 300px; */
        overflow: auto;       /* shows scrollbar when content overflows */
        -webkit-overflow-scrolling: touch; /* smooth scrolling on iOS */
        border: 1px solid #ddd;
        padding: 8px;
 
    }
</style>