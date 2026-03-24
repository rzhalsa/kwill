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
        { "animal_handling", "wisdom" },
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
        { "sleight_of_hand", "dexterity" },
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
            int level = character.GetValue("level", 1).ToInt32();
            int proficiencyBonus = GetProficiencyBonus(level);

            var abilityScores = GetAbilityScores(character);
            var abilityModifiers = CalculateAbilityModifiers(abilityScores);

            int maxHp = CalculateMaxHp(character, abilityModifiers);

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

            if (!character.Contains("ability_scores") || !character["ability_scores"].IsBsonArray)
                return result;

            var abilityArray = character["ability_scores"].AsBsonArray;
            if (abilityArray.Count == 0 || !abilityArray[0].IsBsonDocument)
                return result;

            var abilityDoc = abilityArray[0].AsBsonDocument;

            result["strength"] = ParseScore(abilityDoc, "score_strength");
            result["dexterity"] = ParseScore(abilityDoc, "score_dexterity");
            result["constitution"] = ParseScore(abilityDoc, "score_constitution");
            result["intelligence"] = ParseScore(abilityDoc, "score_intelligence");
            result["wisdom"] = ParseScore(abilityDoc, "score_wisdom");
            result["charisma"] = ParseScore(abilityDoc, "score_charisma");

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
        private static int CalculateMaxHp(BsonDocument character, BsonDocument abilityModifiers)
        {
            int conMod = abilityModifiers.GetValue("constitution", 0).ToInt32();

            if (!character.Contains("class") || !character["class"].IsBsonArray)
                return 1;

            var classArray = character["class"].AsBsonArray;
            if (classArray.Count == 0)
                return 1;

            int totalHp = 0;
            bool firstCharacterLevelHandled = false;

            foreach (var classValue in classArray)
            {
                if (!classValue.IsBsonDocument)
                    continue;

                var classDoc = classValue.AsBsonDocument;

                int classLevel = 0;
                if (classDoc.Contains("class_level"))
                {
                    var levelValue = classDoc["class_level"];
                    if (levelValue.IsString)
                        int.TryParse(levelValue.AsString, out classLevel);
                    else if (levelValue.IsInt32)
                        classLevel = levelValue.AsInt32;
                }

                int hitDie = 8;
                if (classDoc.Contains("traits") && classDoc["traits"].IsBsonDocument)
                {
                    var traits = classDoc["traits"].AsBsonDocument;
                    if (traits.Contains("hit_point_die"))
                    {
                        hitDie = ParseHitDie(traits["hit_point_die"].ToString());
                    }
                }

                if (classLevel <= 0)
                    continue;

                // First overall character level gets full hit die once
                if (!firstCharacterLevelHandled)
                {
                    totalHp += Math.Max(1, hitDie + conMod);
                    firstCharacterLevelHandled = true;
                    classLevel--;
                }

                // Remaining levels in this class use fixed gain
                int fixedGain = GetFixedHpGain(hitDie);
                for (int i = 0; i < classLevel; i++)
                {
                    totalHp += Math.Max(1, fixedGain + conMod);
                }
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

            var proficientSaves = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (character.Contains("saving_throw_proficiencies") && character["saving_throw_proficiencies"].IsBsonArray)
            {
                foreach (var item in character["saving_throw_proficiencies"].AsBsonArray)
                    proficientSaves.Add(NormalizeKey(item.AsString));
            }

            foreach (var ability in Abilities)
            {
                int total = abilityModifiers.GetValue(ability, 0).ToInt32();
                if (proficientSaves.Contains(ability))
                    total += proficiencyBonus;

                saves[ability] = total;
            }

            return saves;
        }

        //Calculates the characters skills.
        private static BsonDocument CalculateSkills(BsonDocument character, BsonDocument abilityModifiers, int proficiencyBonus)
        {
            var result = new BsonDocument();

            var proficientSkills = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var expertiseSkills = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (character.Contains("skill_proficiencies") && character["skill_proficiencies"].IsBsonArray)
            {
                foreach (var item in character["skill_proficiencies"].AsBsonArray)
                    proficientSkills.Add(NormalizeKey(item.AsString));
            }

            if (character.Contains("skill_expertise") && character["skill_expertise"].IsBsonArray)
            {
                foreach (var item in character["skill_expertise"].AsBsonArray)
                    expertiseSkills.Add(NormalizeKey(item.AsString));
            }

            foreach (var kvp in SkillAbilityMap)
            {
                string skill = kvp.Key;
                string ability = kvp.Value;

                int total = abilityModifiers.GetValue(ability, 0).ToInt32();

                if (expertiseSkills.Contains(skill))
                    total += proficiencyBonus * 2;
                else if (proficientSkills.Contains(skill))
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
        private static string NormalizeKey(string value)
        {
            return value.Trim().ToLowerInvariant().Replace(" ", "_").Replace("-", "_");
        }
    }
}
