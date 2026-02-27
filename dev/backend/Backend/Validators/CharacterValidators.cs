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
        public bool IsValid { get; set; }
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
            "character_sheet", "race", "class", "traits", 
            "feature", "operation", "ability_scores", "background"
        };

        private static readonly HashSet<string> ValidOperationTypes = new HashSet<string>
        {
            "+", "-", "*", "/", "=", "conditional"
        };

        /// <summary>
        /// Validates that object_id is a recognized type
        /// </summary>
        public static bool ValidateObjectId(string objectId)
        {
            return !string.IsNullOrEmpty(objectId) && ValidObjectIds.Contains(objectId);
        }

        /// <summary>
        /// Validates operation_type is valid
        /// </summary>
        public static bool ValidateOperationType(string operationType)
        {
            return !string.IsNullOrEmpty(operationType) && ValidOperationTypes.Contains(operationType);
        }

        /// <summary>
        /// Validates that required fields exist in character sheet root
        /// </summary>
        public static ValidationResult ValidateRequiredFields(BsonDocument character)
        {
            var result = new ValidationResult { IsValid = true };
            
            var requiredFields = new[] { "object_id", "user_id", "character_id", "name", "level", "class" };
            
            foreach (var field in requiredFields)
            {
                if (!character.Contains(field))
                {
                    result.AddError($"Missing required field: {field}");
                }
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
        /// Validates that sum of all class levels equals total character level
        /// Critical for multiclass validation
        /// </summary>
        public static ValidationResult ValidateTotalLevel(BsonArray classes, int expectedTotal)
        {
            var result = new ValidationResult { IsValid = true };
            
            int sum = 0;
            foreach (BsonDocument classObj in classes)
            {
                if (classObj.Contains("class_level"))
                {
                    if (int.TryParse(classObj["class_level"].AsString, out int level))
                    {
                        sum += level;
                    }
                    else
                    {
                        result.AddError($"Invalid class_level format: {classObj["class_level"]}");
                    }
                }
            }
            
            if (sum != expectedTotal)
            {
                result.AddError($"Sum of class levels ({sum}) does not equal total level ({expectedTotal})");
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
            int expected = (score - 10) / 2;
            return modifier == expected;
        }

        /// <summary>
        /// Validates hit die type is valid for D&D
        /// Valid hit dice: d4, d6, d8, d10, d12, d20
        /// </summary>
        public static bool ValidateHitDie(string hitDie)
        {
            var validDice = new HashSet<string> { "d4", "d6", "d8", "d10", "d12", "d20" };
            return !string.IsNullOrEmpty(hitDie) && validDice.Contains(hitDie.ToLower());
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
            return srdClasses.Any(c => c["index"].AsString == classId);
        }

        /// <summary>
        /// Validates race_id exists in SRD races collection
        /// </summary>
        public static bool ValidateRaceExists(string raceId, List<BsonDocument> srdRaces)
        {
            return srdRaces.Any(r => r["index"].AsString == raceId);
        }

        /// <summary>
        /// Validates hit die matches the class's expected hit die
        /// Example: Barbarian must have d12, Wizard must have d6
        /// </summary>
        public static bool ValidateClassHitDie(string classId, string hitDie, List<BsonDocument> srdClasses)
        {
            var classData = srdClasses.FirstOrDefault(c => c["index"].AsString == classId);
            if (classData == null) return false;
            
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
            var result = new ValidationResult { IsValid = true };
            
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
            var result = new ValidationResult { IsValid = true };
            
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
        /// </summary>
        public static ValidationResult ValidateCharacterSheet(
            BsonDocument character,
            Dictionary<string, List<BsonDocument>> srdData)
        {
            var result = new ValidationResult { IsValid = true };
            
            // Structure Validation 
            var structureResult = StructureValidators.ValidateRequiredFields(character);
            if (!structureResult.IsValid)
            {
                result.Errors.AddRange(structureResult.Errors);
                result.IsValid = false;
                return result; // Can't continue without required fields
            }
            
            // Character Level Validation
            // Extract level from operation structure
            // TODO: Implement operation parser to resolve level value
            
            // Class Validation
            if (character.Contains("class") && character["class"].IsBsonArray)
            {
                var classes = character["class"].AsBsonArray;
                
                foreach (BsonDocument classObj in classes)
                {
                    // Validate class_id exists
                    if (classObj.Contains("class_id"))
                    {
                        string classId = classObj["class_id"].AsString;
                        if (!SRDValidators.ValidateClassExists(classId, srdData["srd_classes"]))
                        {
                            result.AddError($"Invalid class_id: {classId}");
                        }
                        
                        // Validate hit die matches class
                        if (classObj.Contains("traits"))
                        {
                            var traits = classObj["traits"].AsBsonDocument;
                            if (traits.Contains("hit_point_die"))
                            {
                                string hitDie = traits["hit_point_die"].AsString;
                                if (!SRDValidators.ValidateClassHitDie(classId, hitDie, srdData["srd_classes"]))
                                {
                                    result.AddError($"Hit die {hitDie} does not match class {classId}");
                                }
                            }
                        }
                    }
                    
                    // Validate class level
                    if (classObj.Contains("class_level"))
                    {
                        if (int.TryParse(classObj["class_level"].AsString, out int classLevel))
                        {
                            if (!CharacterValidators.ValidateClassLevel(classLevel))
                            {
                                result.AddError($"Invalid class level: {classLevel}");
                            }
                        }
                    }
                }
            }
            
            // Ability Score Validation 
            if (character.Contains("ability_scores") && character["ability_scores"].IsBsonArray)
            {
                var abilityScores = character["ability_scores"].AsBsonArray[0].AsBsonDocument;
                
                var abilities = new[] { 
                    "score_strength", "score_dexterity", "score_constitution",
                    "score_intelligence", "score_wisdom", "score_charisma" 
                };
                
                foreach (var ability in abilities)
                {
                    if (abilityScores.Contains(ability))
                    {
                        if (int.TryParse(abilityScores[ability].AsString, out int score))
                        {
                            if (!CharacterValidators.ValidateAbilityScore(score))
                            {
                                result.AddError($"Invalid {ability}: {score} (must be 1-30)");
                            }
                        }
                    }
                }
            }
            
            // Race Validation
            if (character.Contains("race"))
            {
                var race = character["race"].AsBsonDocument;
                if (race.Contains("race_id"))
                {
                    string raceId = race["race_id"].AsString;
                    if (!SRDValidators.ValidateRaceExists(raceId, srdData["srd_races"]))
                    {
                        result.AddError($"Invalid race_id: {raceId}");
                    }
                }
                
                // Validate subrace if present
                if (race.Contains("race") && race["race"].IsBsonDocument)
                {
                    var subrace = race["race"].AsBsonDocument;
                    if (subrace.Contains("race_id"))
                    {
                        string subraceId = subrace["race_id"].AsString;
                        if (!SRDValidators.ValidateRaceExists(subraceId, srdData["srd_races"]))
                        {
                            result.AddError($"Invalid subrace_id: {subraceId}");
                        }
                    }
                }
            }
            
            return result;
        }
    }
}
