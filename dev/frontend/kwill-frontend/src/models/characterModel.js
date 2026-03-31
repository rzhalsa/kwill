import {reactive} from 'vue';
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
                    condition: "ability_charism_score",
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
            charima: {
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
