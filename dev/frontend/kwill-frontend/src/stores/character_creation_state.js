/**
 * Pinia store to hold selected character data while creating a character. When a user is finished
 * creating a character, the final character JSON will be populated via this store.
 */

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useCharacterCreationStore = defineStore('character_creation', {
    state: () => ({
        // Map which holds the state of the currently created character in key-value pairs
        character_state: reactive({
            'name': null,
            'player': null,
            'race': {
                'object_id': 'race',
                'name': '',
            },
            'classes': {
                'firstclass': {
                    'name': "",
                    'level': ""
                }
            },
            'alignment': '',
            'background': { 
                'object_id': "background",
                'name': "" 
            },
            'ability': {
                'object_id': "ability",
                'strength': {
                    'modifier': "",
                    'score': ""
                },
                'dexterity': {
                    'modifier': "",
                    'score': ""
                },
                'constitution': {
                    'modifier': "",
                    'score': ""
                },
                'intelligence': {
                    'modifier': "",
                    'score': ""
                },
                'wisdom': {
                    'modifier': "",
                    'score': ""
                },
                'charisma': {
                    'modifier': "",
                    'score': ""
                },
            },
            'ability_score_method': null,
            'ability_scores': [8, 8, 8, 8, 8, 8],
            'selections': [],
            'points_remaining': 27,
            'age': null,
            'height': null,
            'weight': null,
            'eyes': null,
            'hair': null,
            'skin': null,
            "skills": {
                "object_id": "skills",
                "athletics": {
                    "proficiency": false,
                    "modifier": ""
                },
                "acrobatics": {
                    "proficiency": false,
                    "modifier": ""
                },
                "sleightofhand": {
                    "proficiency": false,
                    "modifier": ""
                },
                "stealth": {
                    "proficiency": false,
                    "modifier": ""
                },
                "arcana": {
                    "proficiency": false,
                    "modifier": ""
                },
                "history": {
                    "proficiency": false,
                    "modifier": ""
                },
                "investigation": {
                    "proficiency": false,
                    "modifier": ""
                },
                "nature": {
                    "proficiency": false,
                    "modifier": ""
                },
                "religion": {
                    "proficiency": false,
                    "modifier": ""
                },
                "animalhandling": {
                    "proficiency": false,
                    "modifier": ""
                },
                "insight": {
                    "proficiency": false,
                    "modifier": ""
                },
                "medicine": {
                    "proficiency": false,
                    "modifier": ""
                },
                "perception": {
                    "proficiency": false,
                    "modifier": ""
                },
                "survival": {
                    "proficiency": false,
                    "modifier": ""
                },
                "deception": {
                    "proficiency": false,
                    "modifier": ""
                },
                "intimidation": {
                    "proficiency": false,
                    "modifier": ""
                },
                "performance": {
                    "proficiency": false,
                    "modifier": ""
                },
                "persuasion": {
                    "proficiency": false,
                    "modifier": ""
                }
            },
            'selected_skills': [],
            'selected_level': '',
            'spellcasting': { class: "" },
            'spells': {
                cantrip1: "",
                cantrip2: "",
                cantrip3: "",
                cantrip4: "",
                cantrip5: "",
                cantrip6: "",
                cantrip7: "",
                cantrip8: "",
                cantrip9: "",
                cantrip10: "",
                cantrip11: "",
                cantrip12: "",
                first: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "" },
                second: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "" },
                third: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10: "" },
                fourth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10: "" },
                fifth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                sixth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                seventh: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                eighth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                ninth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" }
            },
            'feat_amt': 0,
            'equipment': [],
            'gear_amt': 0,
            'proficiency_amt': null,
            'text.personality': null,
            'text.ideals': null,
            'text.bonds': null,
            'text.flaws': null,
            'text.features': [],
            'backstory': null,
            'appearance': null
        }),
        is_dirty: false,    // tracks whether changes have been made to character_state
        allow_leave: false  // tracks whether the user has finished the character creation process
    }),
    getters: {
        /**
         * Returns the current character state map
         * @returns the current character state map
         */
        getCharacterState() {
            return this.character_state
        },
    },
    actions: {
        /**
         * Sets the value at key
         * @param key the key to set the value at
         * @param value the value to set
         */
        setCharacterState(key, value) {
            this.character_state[key] = value
        },
        /**
         * Sets is_dirty to be true
         */
        markDirty() {
            this.is_dirty = true
        },
        /**
         * Sets is_dirty to be false
         */
        markClean() {
            this.is_dirty = false
        },
        /**
         * Resets all values in the character state map
         */
        resetStore() {
            for(const [key, value] of Object.entries(this.character_state)) {
                switch(key) {
                    case 'feat_amt':
                    case 'gear_amt':
                        this.character_state[key] = 0
                        break
                    case 'points_remaining':
                        this.character_state[key] = 27
                        break
                    case 'background':
                        this.character_state[key] = { 
                            'object_id': "background",
                            'name': "" 
                        }
                        break
                    case 'selections':
                    case 'selected_skills':
                    case 'features':
                    case 'equipment':
                    case 'text.features':
                        this.character_state[key] = []
                        break
                    case 'ability_scores':
                        this.character_state[key] = [8, 8, 8, 8, 8, 8]
                        break
                    case 'ability':
                        this.character_state[key] = {
                            'object_id': "ability",
                            'strength': {
                                'modifier': "",
                                'score': ""
                            },
                            'dexterity': {
                                'modifier': "",
                                'score': ""
                            },
                            'constitution': {
                                'modifier': "",
                                'score': ""
                            },
                            'intelligence': {
                                'modifier': "",
                                'score': ""
                            },
                            'wisdom': {
                                'modifier': "",
                                'score': ""
                            },
                            'charisma': {
                                'modifier': "",
                                'score': ""
                            },
                        }
                        break
                    case 'classes': 
                        this.character_state[key] = {
                            'firstclass': {
                                'name': "",
                                'level': ""
                            }
                        }
                        break
                    case 'race': 
                        this.character_state[key] = {
                            'object_id': 'race',
                            'name': '',
                        }
                        break
                    case "skills":
                        this.character_state[key] = {
                                "object_id": "skills",
                                "athletics": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "acrobatics": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "sleightofhand": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "stealth": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "arcana": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "history": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "investigation": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "nature": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "religion": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "animalhandling": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "insight": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "medicine": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "perception": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "survival": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "deception": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "intimidation": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "performance": {
                                    "proficiency": false,
                                    "modifier": ""
                                },
                                "persuasion": {
                                    "proficiency": false,
                                    "modifier": ""
                                }
                            }
                        break
                    case 'spellcasting':
                        this.character_state[key] = { class: "" }
                        break
                    case 'spells':
                        this.character_state[key] = {
                            cantrip1: "",
                            cantrip2: "",
                            cantrip3: "",
                            cantrip4: "",
                            cantrip5: "",
                            cantrip6: "",
                            cantrip7: "",
                            cantrip8: "",
                            cantrip9: "",
                            cantrip10: "",
                            cantrip11: "",
                            cantrip12: "",
                            first: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "" },
                            second: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "" },
                            third: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10: "" },
                            fourth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10: "" },
                            fifth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                            sixth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                            seventh: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                            eighth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
                            ninth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" }
                        }
                        break
                    default:
                        this.character_state[key] = ''
                        break
                }
            }
            this.is_dirty = false
            this.allow_leave = false
        },
        /**
         * Separate function for resetting skill proficiencies when the user
         * changes their selected class
         */
        resetSkills() {
            this.character_state.selected_skills = []
            this.character_state.skills = {
                "object_id": "skills",
                "athletics": {
                    "proficiency": false,
                    "modifier": ""
                },
                "acrobatics": {
                    "proficiency": false,
                    "modifier": ""
                },
                "sleightofhand": {
                    "proficiency": false,
                    "modifier": ""
                },
                "stealth": {
                    "proficiency": false,
                    "modifier": ""
                },
                "arcana": {
                    "proficiency": false,
                    "modifier": ""
                },
                "history": {
                    "proficiency": false,
                    "modifier": ""
                },
                "investigation": {
                    "proficiency": false,
                    "modifier": ""
                },
                "nature": {
                    "proficiency": false,
                    "modifier": ""
                },
                "religion": {
                    "proficiency": false,
                    "modifier": ""
                },
                "animalhandling": {
                    "proficiency": false,
                    "modifier": ""
                },
                "insight": {
                    "proficiency": false,
                    "modifier": ""
                },
                "medicine": {
                    "proficiency": false,
                    "modifier": ""
                },
                "perception": {
                    "proficiency": false,
                    "modifier": ""
                },
                "survival": {
                    "proficiency": false,
                    "modifier": ""
                },
                "deception": {
                    "proficiency": false,
                    "modifier": ""
                },
                "intimidation": {
                    "proficiency": false,
                    "modifier": ""
                },
                "performance": {
                    "proficiency": false,
                    "modifier": ""
                },
                "persuasion": {
                    "proficiency": false,
                    "modifier": ""
                }
            }
        }
    }
})