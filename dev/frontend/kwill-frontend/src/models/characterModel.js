<<<<<<< HEAD
import {reactive} from 'vue';
import api from '../services/api';

export function createCharacter(){
=======
import { reactive } from 'vue';
/**
 * Creates a JSON character model
 * @returns a created character model
 */
export function createCharacter() {
>>>>>>> main
    return reactive({
        object_id: "character",
        name: "",
        race: { object_id: "race", name: "" },
        alignment: "",
        background: { object_id: "background", name: "" },
        player: "",
        exp: "",
        ability: {
            object_id: "ability",
            strength: {
                modifier: "",
                score: ""
            },
            dexterity: {
                modifier: "",
                score: ""
            },
            constitution: {
                modifier: "",
                score: ""
            },
            intelligence: {
                modifier: "",
                score: ""
            },
            wisdom: {
                modifier: "",
                score: ""
            },
            charisma: {
                modifier: "",
                score: ""
            },
        },
        saves: {
            object_id: "saves",
            strength: {
                proficiency: false,
                modifier: ""
            },
            dexterity: {
                proficiency: false,
                modifier: ""
            },
            constitution: {
                proficiency: false,
                modifier: ""
            },
            intelligence: {
                proficiency: false,
                modifier: ""
            },
            wisdom: {
                proficiency: false,
                modifier: ""
            },
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
        coins: { copper: "", silver: "", electrum: "", gold: "", platinum: "" },
<<<<<<< HEAD
        equipment: {text: ""},
=======
        equipment: { text: "" },
        classes: {
            firstclass: {
                name: "",
                level: ""
            }
        },

>>>>>>> main
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
<<<<<<< HEAD
        classes:{
            firstclass:{
                name: "",
                level: ""
            }
        }
        });
}

export async function updateCharacter(characterId, characterData, userId){
    try {
        const payload = {...characterData, user_id: userId}
        const response = await api.put(`/api/character/${characterId}`, payload);
        console.log("created character successfully: ",response.data );
        return response.data;
    } catch (error) {
        console.error("Failed to post API data: ", error)
    }
}
export async function postCharacter(characterData, userId){
    try {
        const payload = {...characterData, user_id: userId};
        const response = await api.post("/api/character", payload);
        console.log("created character successfully: ",response.data );
        return response.data;
    } catch (error) {
        console.error("Failed to post API data: ", error)
=======
    });
}

/**
 * Turns currently created character to the characterModel JSON and logs it
 * @param character an instance of createCharacter() from characterModel.js
 * @param map the map data structure to translate into characterModel JSON. It MUST
 * be compatible with the structure in characterModel.js
 */
export function toJson(character, map) {
    for (const key of Object.keys(map)) {
        // Create an array of keys indexed by '.' for the purpose of indexing nested indices
        const keys = key.split('.')

        // Call setValue() if the leftmost key in keys in in the first layer of character
        if (keys[0] in character) {
            setValue(character, keys, map[key])
        }
    }
    return character
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
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current_layer)) { // return if keys[i] is not in this layer
            return
        }
        current_layer = current_layer[keys[i]]  // update current layer
    }

    // Populate value
    const lastKey = keys[keys.length - 1]
    if (lastKey in current_layer) {
        current_layer[lastKey] = value
    }
}

export function copyJsonToCharacter(character, jsonData) {
    const sourceData = jsonData.character || jsonData;
    
    function copyValues(target, source) {
        for (const key in source) {
            if (key === 'object_id') continue;
            
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (source[key].object_id === 'operation') {
                    continue;
                }
                
                if (target[key] && typeof target[key] === 'object') {
                    copyValues(target[key], source[key]);
                } else {
                    target[key] = JSON.parse(JSON.stringify(source[key]));
                }
            } else {
                target[key] = source[key];
            }
        }
>>>>>>> main
    }
    
    copyValues(character, sourceData);
}