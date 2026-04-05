import {reactive} from 'vue';
import api from '../services/api';

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
                score: "10"
            },
            dexterity: {
                score: "10"
            },
            constitution: {
                score: "10"
            },
            intelligence: {
                score: "10"
            },
            wisdom: {
                score: "10"
            },
            charisma: {
                score: "10"
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
        ac: "10",
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
        equipment: {text: ""},
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
            first: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10:"" },
            second: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10:"" },
            third: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10:"" },
            fourth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, prepared7: false, prepared8: false, prepared9: false, prepared10: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "", spell7: "", spell8: "", spell9: "", spell10:"" },
            fifth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
            sixth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: ""},
            seventh: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: ""},
            eighth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: "" },
            ninth: { prepared1: false, prepared2: false, prepared3: false, prepared4: false, prepared5: false, prepared6: false, spell1: "", spell2: "", spell3: "", spell4: "", spell5: "", spell6: ""}
        },
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
    }
}