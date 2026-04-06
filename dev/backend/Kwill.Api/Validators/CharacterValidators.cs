/*
 * Kwill Character Validation Module
 * Evan Farling - Sprint 1
 * 
 * Modular validators for Kyle's JSON character model
 * These validate both structure (JSON format) and game rules (D&D 5e)
 */

using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;

namespace Kwill.Validation
{
    public class ValidationResult
    {
        public bool IsValid { get; set; } = true;
        public List<string> Errors { get; set; } = new List<string>();

        public void AddError(string error)
        {
            IsValid = false;
            Errors.Add(error);
        }
    }

    // LAYER 1: STRUCTURE VALIDATORS

    public static class StructureValidators
    {
        private static readonly HashSet<string> ValidObjectIds = new HashSet<string>
        {
            "character", "race", "class", "traits",
            "feature", "operation", "ability", "background",
            "saves", "skills", "death"
        };

        private static readonly HashSet<string> ValidOperationTypes = new HashSet<string>
        {
            "+", "-", "*", "/", "=", "conditional", "mirror"
        };

        /// <summary>
        /// Validates that object_id is a recognized type
        /// </summary>
        public static bool ValidateObjectId(string objectId)
        {
            return !string.IsNullOrWhiteSpace(objectId) && ValidObjectIds.Contains(objectId);
        }

        /// <summary>
        /// Validates operation_type is valid
        /// </summary>
        public static bool ValidateOperationType(string operationType)
        {
            return !string.IsNullOrWhiteSpace(operationType) && ValidOperationTypes.Contains(operationType);
        }

        /// <summary>
        /// Validates that required fields exist in character sheet root
        /// Updated for new sheet structure
        /// </summary>
        public static ValidationResult ValidateRequiredFields(BsonDocument character)
        {
            var result = new ValidationResult();

            var requiredFields = new[]
            {
                "object_id", "userid", "characterid", "name", "classes", "race", "ability"
            };

            foreach (var field in requiredFields)
            {
                if (!character.Contains(field))
                {
                    result.AddError($"Missing required field: {field}");
                }
            }

            if (character.Contains("object_id") &&
                (!character["object_id"].IsString || character["object_id"].AsString != "character"))
            {
                result.AddError("object_id must be 'character'");
            }

            return result;
        }
    }

    // LAYER 2: D&D RULES VALIDATORS

    public static class CharacterValidators
    {
        /// <summary>
        /// Validates character level is 1-20
        /// Per D&D 5e rules, max level is 20
        /// </summary>
        public static bool ValidateCharacterLevel(int level)
        {
            return level >= 1 && level <= 20;
        }

        /// <summary>
        /// Validates class level is 1-20
        /// </summary>
        public static bool ValidateClassLevel(int classLevel)
        {
            return classLevel >= 1 && classLevel <= 20;
        }

        /// <summary>
        /// Validates that sum of all class levels forms a valid total character level
        /// Updated for new sheet structure where classes is a BsonDocument, not BsonArray
        /// </summary>
        public static ValidationResult ValidateTotalLevel(BsonDocument classes)
        {
            var result = new ValidationResult();
            int sum = 0;

            foreach (var element in classes.Elements)
            {
                if (!element.Value.IsBsonDocument)
                {
                    result.AddError($"Class entry '{element.Name}' must be an object");
                    continue;
                }

                var classObj = element.Value.AsBsonDocument;

                if (!classObj.Contains("level"))
                {
                    result.AddError($"Class entry '{element.Name}' is missing level");
                    continue;
                }

                if (!TryGetInt(classObj["level"], out int level))
                {
                    result.AddError($"Invalid level format in class entry '{element.Name}'");
                    continue;
                }

                sum += level;
            }

            if (!ValidateCharacterLevel(sum))
            {
                result.AddError($"Total character level is invalid: {sum} (must be 1-20)");
            }

            return result;
        }

        /// <summary>
        /// Validates proficiency bonus matches character level
        /// Proficiency bonus = 2 + floor((level - 1) / 4)
        /// Ranges: +2 (L1-4), +3 (L5-8), +4 (L9-12), +5 (L13-16), +6 (L17-20)
        /// </summary>
        public static bool ValidateProficiencyBonus(int bonus, int level)
        {
            int expected = 2 + ((level - 1) / 4);
            return bonus == expected;
        }

        /// <summary>
        /// Validates ability score is within valid range
        /// Standard range: 1-30 (includes racial bonuses, magic items, etc.)
        /// </summary>
        public static bool ValidateAbilityScore(int score)
        {
            return score >= 1 && score <= 30;
        }

        /// <summary>
        /// Validates ability modifier matches ability score
        /// Modifier = floor((score - 10) / 2)
        /// </summary>
        public static bool ValidateAbilityModifier(int score, int modifier)
        {
            int expected = (int)Math.Floor((score - 10) / 2.0);
            return modifier == expected;
        }

        /// <summary>
        /// Validates hit die type is valid for D&D
        /// Valid hit dice: d4, d6, d8, d10, d12, d20
        /// </summary>
        public static bool ValidateHitDie(string hitDie)
        {
            var validDice = new HashSet<string> { "d4", "d6", "d8", "d10", "d12", "d20" };
            return !string.IsNullOrWhiteSpace(hitDie) && validDice.Contains(hitDie.ToLower());
        }

        /// <summary>
        /// Safely converts BsonValue to int
        /// Supports int, long, double, and numeric strings
        /// </summary>
        public static bool TryGetInt(BsonValue value, out int result)
        {
            result = 0;

            if (value == null || value.IsBsonNull)
                return false;

            if (value.IsInt32)
            {
                result = value.AsInt32;
                return true;
            }

            if (value.IsInt64)
            {
                result = (int)value.AsInt64;
                return true;
            }

            if (value.IsDouble)
            {
                result = (int)value.AsDouble;
                return true;
            }

            if (value.IsString && int.TryParse(value.AsString, out int parsed))
            {
                result = parsed;
                return true;
            }

            return false;
        }
    }

    // LAYER 3: SRD REFERENCE VALIDATORS

    public static class SRDValidators
    {
        /// <summary>
        /// Validates class_id exists in SRD classes collection
        /// </summary>
        public static bool ValidateClassExists(string classId, List<BsonDocument> srdClasses)
        {
            return srdClasses.Any(c => c.Contains("index") && c["index"].AsString == classId);
        }

        /// <summary>
        /// Validates race_id exists in SRD races collection
        /// </summary>
        public static bool ValidateRaceExists(string raceId, List<BsonDocument> srdRaces)
        {
            return srdRaces.Any(r => r.Contains("index") && r["index"].AsString == raceId);
        }

        /// <summary>
        /// Validates hit die matches the class's expected hit die
        /// Example: Barbarian must have d12, Wizard must have d6
        /// </summary>
        public static bool ValidateClassHitDie(string classId, string hitDie, List<BsonDocument> srdClasses)
        {
            var classData = srdClasses.FirstOrDefault(c => c.Contains("index") && c["index"].AsString == classId);
            if (classData == null || !classData.Contains("hit_die")) return false;

            int expectedHitDie = classData["hit_die"].AsInt32;
            return hitDie == $"d{expectedHitDie}";
        }

        /// <summary>
        /// Validates all proficiencies are valid skills/tools/weapons
        /// Checks against SRD skills and proficiencies collections
        /// </summary>
        public static ValidationResult ValidateProficiencies(
            List<string> proficiencies,
            List<BsonDocument> srdSkills,
            List<BsonDocument> srdProficiencies)
        {
            var result = new ValidationResult();

            var validSkills = new HashSet<string>(
                srdSkills.Select(s => s["index"].AsString)
            );

            var validProficiencies = new HashSet<string>(
                srdProficiencies.Select(p => p["index"].AsString)
            );

            foreach (var prof in proficiencies)
            {
                if (!validSkills.Contains(prof) && !validProficiencies.Contains(prof))
                {
                    result.AddError($"Invalid proficiency: {prof}");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates spell exists in SRD and is available to character's class
        /// </summary>
        public static ValidationResult ValidateSpell(
            string spellId,
            string classId,
            List<BsonDocument> srdSpells)
        {
            var result = new ValidationResult();

            var spell = srdSpells.FirstOrDefault(s => s["index"].AsString == spellId);

            if (spell == null)
            {
                result.AddError($"Spell not found: {spellId}");
                return result;
            }

            var spellClasses = spell["classes"].AsBsonArray
                .Select(c => c.AsString)
                .ToList();

            if (!spellClasses.Contains(classId))
            {
                result.AddError($"Spell {spellId} not available to class {classId}");
            }

            return result;
        }
    }

    // COMPOSITE VALIDATOR (calls all modular validators)

    public static class CharacterSheetValidator
    {
        /// <summary>
        /// Master validation function that checks entire character sheet
        /// Calls all modular validators and aggregates results
        /// Updated for new character sheet structure
        /// </summary>
        public static ValidationResult ValidateCharacterSheet(
            BsonDocument character,
            Dictionary<string, List<BsonDocument>> srdData)
        {
            var result = new ValidationResult();

            // Structure Validation
            var structureResult = StructureValidators.ValidateRequiredFields(character);
            if (!structureResult.IsValid)
            {
                result.Errors.AddRange(structureResult.Errors);
                result.IsValid = false;
                return result; // Can't continue without required fields
            }

            // Class Validation
            // New sheet uses classes.{slot}.name and classes.{slot}.level
            if (character.Contains("classes"))
            {
                if (character["classes"].IsBsonDocument)
                {
                    var classesDoc = character["classes"].AsBsonDocument;

                    if (classesDoc.ElementCount == 0)
                    {
                        result.AddError("classes must contain at least one class");
                    }
                    else
                    {
                        var totalLevelResult = CharacterValidators.ValidateTotalLevel(classesDoc);
                        if (!totalLevelResult.IsValid)
                        {
                            result.Errors.AddRange(totalLevelResult.Errors);
                            result.IsValid = false;
                        }

                        foreach (var classEntry in classesDoc.Elements)
                        {
                            if (!classEntry.Value.IsBsonDocument)
                            {
                                result.AddError($"Class entry '{classEntry.Name}' must be an object");
                                continue;
                            }

                            var classDoc = classEntry.Value.AsBsonDocument;

                            if (!classDoc.Contains("name") || !classDoc["name"].IsString)
                            {
                                result.AddError($"Class entry '{classEntry.Name}' missing valid name");
                            }
                            else
                            {
                                string className = classDoc["name"].AsString;

                                if (string.IsNullOrWhiteSpace(className))
                                {
                                    result.AddError($"Class entry '{classEntry.Name}' has empty name");
                                }
                                else
                                {
                                    string normalizedClass = NormalizeKey(className);
                                    if (srdData.ContainsKey("srd_classes") &&
                                        !SRDValidators.ValidateClassExists(normalizedClass, srdData["srd_classes"]))
                                    {
                                        result.AddError($"Invalid class: {className}");
                                    }
                                }
                            }

                            if (!classDoc.Contains("level"))
                            {
                                result.AddError($"Class entry '{classEntry.Name}' missing level");
                            }
                            else if (!CharacterValidators.TryGetInt(classDoc["level"], out int classLevel))
                            {
                                result.AddError($"Invalid level format in class entry '{classEntry.Name}'");
                            }
                            else if (!CharacterValidators.ValidateClassLevel(classLevel))
                            {
                                result.AddError($"Invalid class level in '{classEntry.Name}': {classLevel}");
                            }
                        }
                    }
                }
                else
                {
                    result.AddError("classes must be an object");
                }
            }

            // Ability Score Validation
            // New sheet stores score directly at ability.{stat}.score
            if (character.Contains("ability") && character["ability"].IsBsonDocument)
            {
                var ability = character["ability"].AsBsonDocument;

                var abilities = new[]
                {
                    "strength", "dexterity", "constitution",
                    "intelligence", "wisdom", "charisma"
                };

                foreach (var stat in abilities)
                {
                    if (!ability.Contains(stat) || !ability[stat].IsBsonDocument)
                    {
                        result.AddError($"Missing ability block: {stat}");
                        continue;
                    }

                    var statDoc = ability[stat].AsBsonDocument;

                    if (!statDoc.Contains("score"))
                    {
                        result.AddError($"Missing score for {stat}");
                        continue;
                    }

                    int score;
                    var scoreValue = statDoc["score"];

                    if (!CharacterValidators.TryGetInt(scoreValue, out score))
                    {
                        result.AddError($"Invalid score format for {stat}");
                        continue;
                    }

                    if (!CharacterValidators.ValidateAbilityScore(score))
                    {
                        result.AddError($"Invalid {stat} score: {score} (must be 1-30)");
                    }

                    if (!statDoc.Contains("modifier"))
                    {
                        result.AddError($"Missing modifier block for {stat}");
                        continue;
                    }
                }
            }
            
            else
            {
                result.AddError("Missing ability object");
            }

            // Race Validation
            // New sheet uses race.name instead of race as a plain string
            if (character.Contains("race"))
            {
                if (character["race"].IsBsonDocument)
                {
                    var raceDoc = character["race"].AsBsonDocument;

                    if (!raceDoc.Contains("name") || !raceDoc["name"].IsString)
                    {
                        result.AddError("race.name is required and must be a string");
                    }
                    else
                    {
                        string raceName = raceDoc["name"].AsString;

                        if (string.IsNullOrWhiteSpace(raceName))
                        {
                            result.AddError("Race cannot be empty");
                        }
                        else
                        {
                            string normalizedRace = NormalizeKey(raceName);
                            if (srdData.ContainsKey("races") &&
                                !SRDValidators.ValidateRaceExists(normalizedRace, srdData["srd_races"]))
                            {
                                result.AddError($"Invalid race: {raceName}");
                            }
                        }
                    }
                }
                else
                {
                    result.AddError("race must be an object");
                }
            }

            return result;
        }

        private static string NormalizeKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            return value.Trim().ToLowerInvariant().Replace(" ", "-");
        }
    }
}
