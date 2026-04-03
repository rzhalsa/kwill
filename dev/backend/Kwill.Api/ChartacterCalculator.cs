using System;
using System.Collections.Generic;
using System.Linq;

namespace Kwill.Api
{
    using MongoDB.Bson;
    using System;
    using System.Collections.Generic;
    using System.Linq;

    public static class CharacterSheetCalculator
    {
        private static readonly Dictionary<string, string> SkillAbilityMap = new(StringComparer.OrdinalIgnoreCase)
    {
        { "acrobatics", "dexterity" },
        { "animalhandling", "wisdom" },
        { "arcana", "intelligence" },
        { "athletics", "strength" },
        { "deception", "charisma" },
        { "history", "intelligence" },
        { "insight", "wisdom" },
        { "intimidation", "charisma" },
        { "investigation", "intelligence" },
        { "medicine", "wisdom" },
        { "nature", "intelligence" },
        { "perception", "wisdom" },
        { "performance", "charisma" },
        { "persuasion", "charisma" },
        { "religion", "intelligence" },
        { "sleightofhand", "dexterity" },
        { "stealth", "dexterity" },
        { "survival", "wisdom" }
    };

        private static readonly string[] Abilities =
        {
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma"
    };
        //Calls other methods to calculate the stats on the character sheet then returns the modified BsonDocument.
        public static BsonDocument Calculate(BsonDocument character, Dictionary<string, List<BsonDocument>> srdData)
        {
            int level = ParseInt(character.GetValue("level", 1), 1);
            int proficiencyBonus = GetProficiencyBonus(level);

            var abilityScores = GetAbilityScores(character);
            var abilityModifiers = CalculateAbilityModifiers(abilityScores);

            int maxHp = CalculateMaxHp(character, abilityModifiers, srdData);

            var savingThrows = CalculateSavingThrows(character, abilityModifiers, proficiencyBonus);
            var skills = CalculateSkills(character, abilityModifiers, proficiencyBonus);
            var weapons = CalculateWeapons(character, abilityScores, proficiencyBonus);

            return new BsonDocument
        {
            { "level", level },
            { "proficiency_bonus", proficiencyBonus },
            { "max_hp", maxHp },
            { "ability_modifiers", abilityModifiers },
            { "saving_throw_bonuses", savingThrows },
            { "skill_bonuses", skills },
            { "weapon_stats", weapons }
        };
        }

        //Gets the ability scores
        private static BsonDocument GetAbilityScores(BsonDocument character)
        {
            var result = new BsonDocument
    {
        { "strength", 10 },
        { "dexterity", 10 },
        { "constitution", 10 },
        { "intelligence", 10 },
        { "wisdom", 10 },
        { "charisma", 10 }
    };

            if (!character.Contains("ability") || !character["ability"].IsBsonDocument)
                return result;

            var abilityDoc = character["ability"].AsBsonDocument;

            foreach (var ability in Abilities)
            {
                if (!abilityDoc.Contains(ability) || !abilityDoc[ability].IsBsonDocument)
                    continue;

                var statDoc = abilityDoc[ability].AsBsonDocument;

                if (!statDoc.Contains("modifier") || !statDoc["modifier"].IsBsonDocument)
                    continue;

                var modifierDoc = statDoc["modifier"].AsBsonDocument;

                if (!modifierDoc.Contains("score"))
                    continue;

                result[ability] = ParseInt(modifierDoc["score"], 10);
            }

            return result;
        }

        //Parses the score so it can be calculated.
        private static int ParseScore(BsonDocument doc, string fieldName)
        {
            if (!doc.Contains(fieldName))
                return 10;

            var value = doc[fieldName];

            if (value.IsInt32) return value.AsInt32;
            if (value.IsInt64) return (int)value.AsInt64;
            if (value.IsString && int.TryParse(value.AsString, out int parsed)) return parsed;

            return 10;
        }

        //Calculates ability modifiers for the 
        private static BsonDocument CalculateAbilityModifiers(BsonDocument abilityScores)
        {
            var mods = new BsonDocument();

            foreach (var ability in Abilities)
            {
                int score = abilityScores.GetValue(ability, 10).ToInt32();
                mods[ability] = GetAbilityModifier(score);
            }

            return mods;
        }

        //gets the ability modifier
        private static int GetAbilityModifier(int score)
        {
            return (int)Math.Floor((score - 10) / 2.0);
        }

        //Gets proficiency bonuses
        private static int GetProficiencyBonus(int level)
        {
            if (level <= 4) return 2;
            if (level <= 8) return 3;
            if (level <= 12) return 4;
            if (level <= 16) return 5;
            return 6;
        }

        //Calculates the maximum hp for the character.
        private static int CalculateMaxHp(BsonDocument character, BsonDocument abilityModifiers, Dictionary<string, List<BsonDocument>> srdData)
        {
            int conMod = abilityModifiers.GetValue("constitution", 0).ToInt32();
            int level = ParseInt(character.GetValue("level", 1), 1);

            if (!character.Contains("class") || !character["class"].IsString)
                return Math.Max(1, 8 + conMod);

            string className = character["class"].AsString;
            string classIndex = NormalizeSrdIndex(className);

            int hitDie = 8;

            if (srdData.ContainsKey("srd_classes"))
            {
                var classData = srdData["srd_classes"]
                    .FirstOrDefault(c => c.Contains("index") && c["index"].AsString == classIndex);

                if (classData != null && classData.Contains("hit_die"))
                {
                    hitDie = ParseInt(classData["hit_die"], 8);
                }
            }

            int totalHp = Math.Max(1, hitDie + conMod);

            int fixedGain = GetFixedHpGain(hitDie);
            for (int i = 2; i <= level; i++)
            {
                totalHp += Math.Max(1, fixedGain + conMod);
            }

            return Math.Max(1, totalHp);
        }

        //parses die to an int so it can be used in calculations.
        private static int ParseHitDie(string hitDieText)
        {
            return hitDieText.Trim().ToLowerInvariant() switch
            {
                "d6" => 6,
                "d8" => 8,
                "d10" => 10,
                "d12" => 12,
                _ => 8
            };
        }

        //converts fixed hitpoints into an int so it can be calculated.
        private static int GetFixedHpGain(int hitDie)
        {
            return hitDie switch
            {
                6 => 4,
                8 => 5,
                10 => 6,
                12 => 7,
                _ => 5
            };
        }
        //Calculates saving throws.
        private static BsonDocument CalculateSavingThrows(BsonDocument character, BsonDocument abilityModifiers, int proficiencyBonus)
        {
            var saves = new BsonDocument();

            foreach (var ability in Abilities)
            {
                int total = abilityModifiers.GetValue(ability, 0).ToInt32();
                bool proficient = false;

                if (character.Contains("saves") && character["saves"].IsBsonDocument)
                {
                    var savesDoc = character["saves"].AsBsonDocument;

                    if (savesDoc.Contains(ability) && savesDoc[ability].IsBsonDocument)
                    {
                        var saveDoc = savesDoc[ability].AsBsonDocument;
                        if (saveDoc.Contains("proficiency"))
                            proficient = saveDoc["proficiency"].ToBoolean();
                    }
                }

                if (proficient)
                    total += proficiencyBonus;

                saves[ability] = total;
            }

            return saves;
        }

        //Calculates the characters skills.
        private static BsonDocument CalculateSkills(BsonDocument character, BsonDocument abilityModifiers, int proficiencyBonus)
        {
            var result = new BsonDocument();

            BsonDocument? skillsDoc = null;
            if (character.Contains("skills") && character["skills"].IsBsonDocument)
                skillsDoc = character["skills"].AsBsonDocument;

            var expertiseSkills = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            // Optional legacy/global expertise array support
            if (character.Contains("skill_expertise") && character["skill_expertise"].IsBsonArray)
            {
                foreach (var item in character["skill_expertise"].AsBsonArray)
                {
                    if (item.IsString)
                        expertiseSkills.Add(item.AsString.Trim().ToLowerInvariant());
                }
            }

            foreach (var kvp in SkillAbilityMap)
            {
                string skill = kvp.Key;
                string ability = kvp.Value;

                int total = abilityModifiers.GetValue(ability, 0).ToInt32();
                bool proficient = false;
                bool expertise = false;

                if (skillsDoc != null && skillsDoc.Contains(skill) && skillsDoc[skill].IsBsonDocument)
                {
                    var skillDoc = skillsDoc[skill].AsBsonDocument;

                    if (skillDoc.Contains("proficiency"))
                        proficient = skillDoc["proficiency"].ToBoolean();

                    // New frontend-friendly expertise flag
                    if (skillDoc.Contains("expertise"))
                        expertise = skillDoc["expertise"].ToBoolean();
                }

                // Legacy/global expertise array can also mark expertise
                if (expertiseSkills.Contains(skill))
                    expertise = true;

                if (expertise)
                    total += proficiencyBonus * 2;
                else if (proficient)
                    total += proficiencyBonus;

                result[skill] = total;
            }

            return result;
        }

        //Calculates the weapon values.
        private static BsonArray CalculateWeapons(BsonDocument character, BsonDocument abilityScores, int proficiencyBonus)
        {
            var result = new BsonArray();

            if (!character.Contains("weapons") || !character["weapons"].IsBsonArray)
                return result;

            foreach (var weaponValue in character["weapons"].AsBsonArray)
            {
                if (!weaponValue.IsBsonDocument)
                    continue;

                var weapon = weaponValue.AsBsonDocument;

                string name = weapon.GetValue("name", "").AsString;
                bool isMelee = weapon.GetValue("is_melee", false).ToBoolean();
                bool isRanged = weapon.GetValue("is_ranged", false).ToBoolean();
                bool hasFinesse = weapon.GetValue("has_finesse", false).ToBoolean();
                bool isProficient = weapon.GetValue("is_proficient", false).ToBoolean();

                int magicAttackBonus = weapon.GetValue("magic_attack_bonus", 0).ToInt32();
                int magicDamageBonus = weapon.GetValue("magic_damage_bonus", 0).ToInt32();

                string attackAbility = GetWeaponAttackAbility(abilityScores, isMelee, isRanged, hasFinesse);
                int abilityMod = GetAbilityModifier(abilityScores.GetValue(attackAbility, 10).ToInt32());

                int attackBonus = abilityMod + magicAttackBonus + (isProficient ? proficiencyBonus : 0);
                int damageBonus = abilityMod + magicDamageBonus;

                result.Add(new BsonDocument
            {
                { "name", name },
                { "attack_ability_used", attackAbility },
                { "attack_bonus", attackBonus },
                { "damage_bonus", damageBonus },
                { "damage_dice", weapon.GetValue("damage_dice", "") },
                { "damage_type", weapon.GetValue("damage_type", "") }
            });
            }

            return result;
        }

        //gets weapon attack ability
        private static string GetWeaponAttackAbility(BsonDocument abilityScores, bool isMelee, bool isRanged, bool hasFinesse)
        {
            if (hasFinesse)
            {
                int strMod = GetAbilityModifier(abilityScores.GetValue("strength", 10).ToInt32());
                int dexMod = GetAbilityModifier(abilityScores.GetValue("dexterity", 10).ToInt32());
                return dexMod > strMod ? "dexterity" : "strength";
            }

            if (isRanged)
                return "dexterity";

            if (isMelee)
                return "strength";

            return "strength";
        }

        //Used to replace spaces and dashes with _
        private static string NormalizeSrdIndex(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            return value.Trim().ToLowerInvariant().Replace(" ", "-");
        }

        //helps to safely parse ints due to potential null values
        private static int ParseInt(BsonValue value, int defaultValue = 0)
        {
            if (value == null || value.IsBsonNull)
                return defaultValue;

            if (value.IsInt32) return value.AsInt32;
            if (value.IsInt64) return (int)value.AsInt64;
            if (value.IsDouble) return (int)value.AsDouble;
            if (value.IsString && int.TryParse(value.AsString, out int parsed)) return parsed;

            return defaultValue;
        }
    }
}
