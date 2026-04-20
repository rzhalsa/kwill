using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;

namespace Kwill.Api
{
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

        public static BsonDocument Calculate(BsonDocument character, Dictionary<string, List<BsonDocument>> srdData)
        {
            var result = character.DeepClone().AsBsonDocument;

            result.Remove("calculated");
            result.Remove("calculated_weapons");

            int level = GetTotalLevel(result);
            int proficiencyBonus = GetProficiencyBonus(level);

            var abilityScores = GetAbilityScores(result);
            var abilityModifiers = CalculateAbilityModifiers(abilityScores);

            int maxHp = CalculateMaxHp(result, abilityModifiers, srdData);
            int ac = CalculateArmorClass(result, abilityModifiers, srdData);
            string speed = CalculateSpeed(result, srdData);
            string hitDiceTotal = CalculateHitDiceTotal(result, srdData);


            var savingThrows = CalculateSavingThrows(result, abilityModifiers, proficiencyBonus);
            var skills = CalculateSkills(result, abilityModifiers, proficiencyBonus);

            FillAbilityModifiers(result, abilityModifiers);
            FillSavingThrows(result, savingThrows);
            FillSkills(result, skills);
            FillHitPoints(result, maxHp);
            FillHitDice(result, hitDiceTotal);
            FillTopLevelStats(result, level, proficiencyBonus, ac, speed, abilityModifiers);

            return result;
        }

        private static int GetTotalLevel(BsonDocument character)
        {
            if (!character.Contains("classes") || !character["classes"].IsBsonDocument)
                return 1;

            var classesDoc = character["classes"].AsBsonDocument;
            int total = 0;

            foreach (var classEntry in classesDoc.Elements)
            {
                if (!classEntry.Value.IsBsonDocument)
                    continue;

                var classDoc = classEntry.Value.AsBsonDocument;

                if (!classDoc.Contains("level"))
                    continue;

                total += ParseInt(classDoc["level"], 0);
            }

            return total > 0 ? total : 1;
        }

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

                if (!statDoc.Contains("score"))
                    continue;

                result[ability] = ParseInt(statDoc["score"], 10);
            }

            return result;
        }

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

        private static int GetAbilityModifier(int score)
        {
            return (int)Math.Floor((score - 10) / 2.0);
        }

        private static int GetProficiencyBonus(int level)
        {
            if (level <= 4) return 2;
            if (level <= 8) return 3;
            if (level <= 12) return 4;
            if (level <= 16) return 5;
            return 6;
        }

        private static int CalculateMaxHp(
            BsonDocument character,
            BsonDocument abilityModifiers,
            Dictionary<string, List<BsonDocument>> srdData)
        {
            int conMod = abilityModifiers.GetValue("constitution", 0).ToInt32();

            if (!character.Contains("classes") || !character["classes"].IsBsonDocument)
                return Math.Max(1, 8 + conMod);

            var classesDoc = character["classes"].AsBsonDocument;
            if (classesDoc.ElementCount == 0)
                return Math.Max(1, 8 + conMod);

            var classLevels = new List<(string ClassName, int Level)>();

            foreach (var classEntry in classesDoc.Elements)
            {
                if (!classEntry.Value.IsBsonDocument)
                    continue;

                var classDoc = classEntry.Value.AsBsonDocument;
                string className = classDoc.GetValue("name", "").AsString;
                int level = ParseInt(classDoc.GetValue("level", 0), 0);

                if (!string.IsNullOrWhiteSpace(className) && level > 0)
                    classLevels.Add((className, level));
            }

            if (classLevels.Count == 0)
                return Math.Max(1, 8 + conMod);

            int totalHp = 0;
            bool firstCharacterLevelApplied = false;

            foreach (var cls in classLevels)
            {
                int hitDie = GetClassHitDie(cls.ClassName, srdData);

                for (int i = 1; i <= cls.Level; i++)
                {
                    if (!firstCharacterLevelApplied)
                    {
                        totalHp += Math.Max(1, hitDie + conMod);
                        firstCharacterLevelApplied = true;
                    }
                    else
                    {
                        totalHp += Math.Max(1, GetFixedHpGain(hitDie) + conMod);
                    }
                }
            }

            return Math.Max(1, totalHp);
        }

        private static int GetClassHitDie(string className, Dictionary<string, List<BsonDocument>> srdData)
        {
            string classIndex = NormalizeSrdIndex(className);

            if (srdData.ContainsKey("srd_classes"))
            {
                var classData = srdData["srd_classes"]
                    .FirstOrDefault(c =>
                        c.Contains("index") &&
                        NormalizeSrdIndex(c["index"].AsString) == classIndex);

                if (classData != null && classData.Contains("hit_die"))
                    return ParseInt(classData["hit_die"], 8);
            }

            return 8;
        }

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

        private static BsonDocument CalculateSkills(BsonDocument character, BsonDocument abilityModifiers, int proficiencyBonus)
        {
            var result = new BsonDocument();

            BsonDocument? skillsDoc = null;
            if (character.Contains("skills") && character["skills"].IsBsonDocument)
                skillsDoc = character["skills"].AsBsonDocument;

            var expertiseSkills = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

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

                    if (skillDoc.Contains("expertise"))
                        expertise = skillDoc["expertise"].ToBoolean();
                }

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

        private static int CalculateArmorClass(
            BsonDocument character,
            BsonDocument abilityModifiers,
            Dictionary<string, List<BsonDocument>> srdData)
        {
            int dexMod = abilityModifiers.GetValue("dexterity", 0).ToInt32();

            int bestAc = 10 + dexMod;
            bool hasShield = false;

            if (!character.Contains("equipment") || !character["equipment"].IsBsonArray)
                return bestAc;

            foreach (var itemValue in character["equipment"].AsBsonArray)
            {
                if (!itemValue.IsString)
                    continue;

                string equipmentName = itemValue.AsString.Trim();
                var srdItem = FindEquipmentInSrd(equipmentName, srdData);

                if (srdItem == null)
                    continue;

                if (IsShield(srdItem))
                {
                    hasShield = true;
                    continue;
                }

                if (TryGetArmorClassFromSrd(srdItem, dexMod, out int armorAc))
                {
                    if (armorAc > bestAc)
                        bestAc = armorAc;
                }
            }

            if (hasShield)
                bestAc += 2;

            return bestAc;
        }

        private static string CalculateSpeed(BsonDocument character, Dictionary<string, List<BsonDocument>> srdData)
        {
            if (!character.Contains("race") || !character["race"].IsBsonDocument)
                return "";

            var raceDoc = character["race"].AsBsonDocument;
            string raceName = raceDoc.GetValue("name", "").AsString;

            if (string.IsNullOrWhiteSpace(raceName))
                return "";

            if (!srdData.ContainsKey("srd_races"))
                return "";

            string normalizedRaceIndex = NormalizeSrdIndex(raceName);

            var raceData = srdData["srd_races"]
                .FirstOrDefault(r =>
                    (r.Contains("index") && NormalizeSrdIndex(r["index"].AsString) == normalizedRaceIndex) ||
                    (r.Contains("name") && NormalizeSrdIndex(r["name"].AsString) == normalizedRaceIndex));

            if (raceData == null)
                return "";

            if (raceData.Contains("speed"))
            {
                int speed = ParseInt(raceData["speed"], 0);
                if (speed > 0)
                    return speed.ToString();
            }

            if (raceData.Contains("speed") && raceData["speed"].IsString)
                return raceData["speed"].AsString;

            return "";
        }

        private static string CalculateHitDiceTotal(BsonDocument character, Dictionary<string, List<BsonDocument>> srdData)
        {
            if (!character.Contains("classes") || !character["classes"].IsBsonDocument)
                return "";

            var classesDoc = character["classes"].AsBsonDocument;
            if (classesDoc.ElementCount == 0)
                return "";

            var groupedDice = new Dictionary<int, int>();

            foreach (var classEntry in classesDoc.Elements)
            {
                if (!classEntry.Value.IsBsonDocument)
                    continue;

                var classDoc = classEntry.Value.AsBsonDocument;
                string className = classDoc.GetValue("name", "").AsString;
                int level = ParseInt(classDoc.GetValue("level", 0), 0);

                if (string.IsNullOrWhiteSpace(className) || level <= 0)
                    continue;

                int hitDie = GetClassHitDie(className, srdData);

                if (!groupedDice.ContainsKey(hitDie))
                    groupedDice[hitDie] = 0;

                groupedDice[hitDie] += level;
            }

            if (groupedDice.Count == 0)
                return "";

            var parts = groupedDice
                .OrderByDescending(kvp => kvp.Key)
                .Select(kvp => $"{kvp.Value}d{kvp.Key}");

            return string.Join(" + ", parts);
        }

        private static BsonDocument? FindEquipmentInSrd(string equipmentName, Dictionary<string, List<BsonDocument>> srdData)
        {
            if (!srdData.ContainsKey("srd_equipment"))
                return null;

            string normalizedName = NormalizeName(equipmentName);

            foreach (var item in srdData["srd_equipment"])
            {
                string name = item.GetValue("name", "").AsString;
                string index = item.GetValue("index", "").AsString;

                if (NormalizeName(name) == normalizedName || NormalizeName(index) == normalizedName)
                    return item;
            }

            return null;
        }

        private static bool IsShield(BsonDocument item)
        {
            string name = item.GetValue("name", "").AsString.ToLowerInvariant();
            string index = item.GetValue("index", "").AsString.ToLowerInvariant();

            if (name.Contains("shield") || index.Contains("shield"))
                return true;

            if (item.Contains("armor_category"))
            {
                string armorCategory = item["armor_category"].ToString().ToLowerInvariant();
                if (armorCategory == "shield")
                    return true;
            }

            return false;
        }

        private static bool TryGetArmorClassFromSrd(BsonDocument item, int dexMod, out int ac)
        {
            ac = 0;

            if (item.Contains("armor_class") && item["armor_class"].IsBsonDocument)
            {
                var armorClassDoc = item["armor_class"].AsBsonDocument;

                int baseAc = ParseInt(armorClassDoc.GetValue("base", 0), 0);
                bool dexBonus = armorClassDoc.GetValue("dex_bonus", false).ToBoolean();

                int dexToAdd = 0;
                if (dexBonus)
                {
                    dexToAdd = dexMod;

                    if (armorClassDoc.Contains("max_bonus") && !armorClassDoc["max_bonus"].IsBsonNull)
                    {
                        int maxBonus = ParseInt(armorClassDoc["max_bonus"], dexMod);
                        dexToAdd = Math.Min(dexToAdd, maxBonus);
                    }
                }

                ac = baseAc + dexToAdd;
                return baseAc > 0;
            }

            if (item.Contains("base_ac"))
            {
                int baseOnly = ParseInt(item["base_ac"], 0);
                if (baseOnly > 0)
                {
                    ac = baseOnly;
                    return true;
                }
            }

            return false;
        }

        private static void FillTopLevelStats(BsonDocument character, int level, int proficiencyBonus, int ac, string speed, BsonDocument abilityModifiers)
        {
            character["level"] = level;
            character["proficiency_bonus"] = proficiencyBonus;
            character["ac"] = ac;
            character["speed"] = speed;


            int dexMod = abilityModifiers.GetValue("dexterity", 0).ToInt32();
            character["initiative"] = FormatSigned(dexMod);
        }

        private static void FillAbilityModifiers(BsonDocument character, BsonDocument abilityModifiers)
        {
            if (!character.Contains("ability") || !character["ability"].IsBsonDocument)
                return;

            var abilityDoc = character["ability"].AsBsonDocument;

            foreach (var ability in Abilities)
            {
                if (!abilityDoc.Contains(ability) || !abilityDoc[ability].IsBsonDocument)
                    continue;

                var statDoc = abilityDoc[ability].AsBsonDocument;
                int mod = abilityModifiers.GetValue(ability, 0).ToInt32();
                statDoc["modifier"] = mod;
            }
        }

        private static void FillHitDice(BsonDocument character, string hitDiceTotal)
        {
            if (!character.Contains("hitDice") || !character["hitDice"].IsBsonDocument)
            {
                character["hitDice"] = new BsonDocument
        {
            { "total", hitDiceTotal },
            { "current", hitDiceTotal }
        };
                return;
            }

            var hitDiceDoc = character["hitDice"].AsBsonDocument;

            hitDiceDoc["total"] = hitDiceTotal;

            if (!hitDiceDoc.Contains("current") ||
                hitDiceDoc["current"].IsBsonNull ||
                string.IsNullOrWhiteSpace(hitDiceDoc["current"].ToString()))
            {
                hitDiceDoc["current"] = hitDiceTotal;
            }
        }

        private static void FillSavingThrows(BsonDocument character, BsonDocument savingThrows)
        {
            if (!character.Contains("saves") || !character["saves"].IsBsonDocument)
                return;

            var savesDoc = character["saves"].AsBsonDocument;

            foreach (var ability in Abilities)
            {
                if (!savesDoc.Contains(ability) || !savesDoc[ability].IsBsonDocument)
                    continue;

                var saveDoc = savesDoc[ability].AsBsonDocument;
                int value = savingThrows.GetValue(ability, 0).ToInt32();
                saveDoc["modifier"] = FormatSigned(value);
            }
        }

        private static void FillSkills(BsonDocument character, BsonDocument skillBonuses)
        {
            if (!character.Contains("skills") || !character["skills"].IsBsonDocument)
                return;

            var skillsDoc = character["skills"].AsBsonDocument;

            foreach (var kvp in SkillAbilityMap)
            {
                string skill = kvp.Key;

                if (!skillsDoc.Contains(skill) || !skillsDoc[skill].IsBsonDocument)
                    continue;

                var skillDoc = skillsDoc[skill].AsBsonDocument;
                int value = skillBonuses.GetValue(skill, 0).ToInt32();
                skillDoc["modifier"] = FormatSigned(value);
            }
        }

        private static void FillHitPoints(BsonDocument character, int maxHp)
        {
            if (!character.Contains("hitpoints") || !character["hitpoints"].IsBsonDocument)
            {
                character["hitpoints"] = new BsonDocument
                {
                    { "current", maxHp.ToString() },
                    { "maximum", maxHp.ToString() },
                    { "temporary", "" }
                };
                return;
            }

            var hpDoc = character["hitpoints"].AsBsonDocument;

            hpDoc["maximum"] = maxHp.ToString();

            if (!hpDoc.Contains("current") ||
                hpDoc["current"].IsBsonNull ||
                string.IsNullOrWhiteSpace(hpDoc["current"].ToString()))
            {
                hpDoc["current"] = maxHp.ToString();
            }

            if (!hpDoc.Contains("temporary"))
                hpDoc["temporary"] = "";
        }

        private static string NormalizeName(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            return value.Trim().ToLowerInvariant()
                .Replace("-", " ")
                .Replace("_", " ");
        }

        private static string NormalizeSrdIndex(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            return value.Trim().ToLowerInvariant().Replace(" ", "-");
        }

        private static string FormatSigned(int value)
        {
            return value >= 0 ? $"+{value}" : value.ToString();
        }

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
