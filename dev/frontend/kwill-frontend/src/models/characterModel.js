import {reactive} from 'vue';
/**
 * Creates a JSON character model
 * @returns a created character model
 */
export function createCharacter(){
    return reactive({
        object_id: "character",
        name: "",
        race: {object_id: "race", name: ""},
        alignment: "",
        background: {object_id: "background",name: ""},
        player: "",
        exp: "",
        ability: {
            object_id: "ability",
            strength: {
            modifier: {
                object_id: "operation",
                operation_type: "conditional",
                condition: "ability_strength_score",
                score: ""
            }
            },
            dexterity: {
            modifier: {
                object_id: "operation",
                operation_type: "conditional",
                condition: "ability_dexterity_score",
                score: ""
            }
            },
            constitution: {
            modifier: {
                object_id: "operation",
                operation_type: "conditional",
                condition: "ability_consitution_score",
                score: ""
            }
            },
            intelligence: {
            modifier: {
                object_id: "operation",
                operation_type: "conditional",
                condition: "ability_intelligence_score",
                score: ""
            }
            },
            wisdom: {
            modifier: {
                object_id: "operation",
                operation_type: "conditional",
                condition: "ability_wisdom_score",
                score: ""
            }
            },
            charisma: {
            modifier: {
                object_id: "operation",
                operation_type: "conditional",
                condition: "ability_charisma_score",
                score: ""
            }
            },
        },
        saves: {
            object_id: "saves",
            strength: {
            proficiency: false,
            modifier: ""
            },
            object_id: "saves",
            dexterity: {
            proficiency: false,
            modifier: ""
            },
            object_id: "saves",
            constitution: {
            proficiency: false,
            modifier: ""
            },
            object_id: "saves",
            intelligence: {
            proficiency: false,
            modifier: ""
            },
            object_id: "saves",
            wisdom: {
            proficiency: false,
            modifier: ""
            },
            object_id: "saves",
            charisma: {
            proficiency: false,
            modifier: ""
            }
        },
        skills: {
            object_id: "skills",
            athletics: { proficiency: false, modifier: "" },
            acrobatics: { proficiency: false, modifier: "" },
            sleightofhand: { proficiency: false, modifier: "" },
            stealth: { proficiency: false, modifier: "" },
            arcana: { proficiency: false, modifier: "" },
            history: { proficiency: false, modifier: "" },
            investigation: { proficiency: false, modifier: "" },
            nature: { proficiency: false, modifier: "" },
            religion: { proficiency: false, modifier: "" },
            animalhandling: { proficiency: false, modifier: "" },
            insight: { proficiency: false, modifier: "" },
            medicine: { proficiency: false, modifier: "" },
            perception: { proficiency: false, modifier: "" },
            survival: { proficiency: false, modifier: "" },
            deception: { proficiency: false, modifier: "" },
            intimidation: { proficiency: false, modifier: "" },
            performance: { proficiency: false, modifier: "" },
            persuasion: { proficiency: false, modifier: "" }
            },
            ac: "",
            initiative: "",
            speed: "",
            hitpoints: { current: "", maximum: "", temporary: "" },
            hitDice: { total: "", current: "" },
            death: {
                object_id: "",
                saves: { success1: false, success2: false, success3: false, failure1: false, failure2: false, failure3: false }
            },
            attacks: "",
            coins: { copper: "", silver: "", electrum: "", gold: "" },
            equipment: "",
            text: {
                personality: "",
                ideals: "",
                bonds: "",
                flaws: "",
                features: ""
            },
            age: "",
            eyes: "",
            height: "",
            skin: "",
            weight: "",
            hair: "",
            appearance: "",
            backstory: "",
            alliesAndOrganizations: "",
            features: { additional: "" },
            treasure: "",
            spellcasting: { class: "" },
            spell: { castingAbility: "", saveDc: "", attackBonus: "" },
            spells: {
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
                "1st": { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "" },
                "2nd": { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "" }
                // … continue 3rd–9th as needed
            },
            classlevel: "",
            class: { object_id: "class", name: "", level: "" }
        });
}

/**
 * Turns currently created character to the characterModel JSON and logs it
 * @param character an instance of createCharacter() from characterModel.js
 * @param map the map data structure to translate into characterModel JSON. It MUST
 * be compatible with the structure in characterModel.js
 */
export function toJson(character, map) {
    for(const [key, value] of map) {
        // Create an array of keys indexed by '.' for the purpose of indexing nested indices
        const keys = key.split('.')

        // Call setValue() if the leftmost key in keys in in the first layer of character
        if(keys[0] in character) {
            setValue(character, keys, value)
        }
    }

    console.log(character)
}

/**
 * Populates a character JSON object
 * @param obj the JSON object to populate into
 * @param keys the array of keys for indexing obj
 * @param value the value to populate into obj
 */
function setValue(obj, keys, value) {
    let current_layer = obj  // var for accessing the current layer of obj

    // Loop through each layer of keys in order to access nested values
    for(let i = 0; i < keys.length - 1; i++) {
        if(!(keys[i] in current_layer)) { // return if keys[i] is not in this layer
            return
        }
        current_layer = current_layer[keys[i]]  // update current layer
    }

    // Populate value
    const lastKey = keys[keys.length - 1]
    if(lastKey in current_layer) {
        current_layer[lastKey] = value
    }
}