﻿using Kwill.Api;
using Kwill.Api.Helpers;
using Kwill.Validation;
using MongoDB.Bson;
using MongoDB.Driver;
using System;

namespace Kwill.Api.Services
{
    public class CharacterService
    {
        private readonly KwillDB.KwillDB _db;

        public CharacterService(KwillDB.KwillDB db) => _db = db;

        //Gets the character sheet.
        public async Task<BsonDocument?> GetByCharacterIdAsync(string characterId)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("characterid", characterId);
            var doc = await _db.CharacterSheets.Find(filter).FirstOrDefaultAsync();

            return doc;
        }

        //Gets all characters from given UserId
        public async Task<List<BsonDocument>> GetByUserIdAsync(string userId)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("userid", userId);
            var docs = await _db.CharacterSheets.Find(filter).ToListAsync();

            return docs;
        }

        //Creates an entry in the mongoDb using the provided BsonDocument.
        public async Task<(bool Success, BsonDocument? Doc, List<string>? Errors, string? ErrorMessage)> CreateAsync(BsonDocument doc)
        {
            try
            {
                var srdData = await LoadSrdDataAsync();
                var validation = CharacterSheetValidator.ValidateCharacterSheet(doc, srdData);
               if (!validation.IsValid)
               {
                    Console.WriteLine($"Validation failed: {string.Join(", ", validation.Errors)}");
                    return (false, null, validation.Errors, null);
               }

                await _db.CharacterSheets.InsertOneAsync(doc);
                return (true, doc, null, null);
            }
            catch (Exception ex)
            {
                return (false, null, null, ex.Message);
            }
        }

        //Updates the specified entry in the mongoDb
        public async Task<(bool Success, BsonDocument? Doc, List<string>? Errors, string? ErrorMessage, bool NotFound, bool Forbidden)> UpdateAsync(
            string userId,
            string characterId,
            BsonDocument doc)
        {
            try
            {
                var filter = Builders<BsonDocument>.Filter.Eq("characterid", characterId);
                var existing = await _db.CharacterSheets.Find(filter).FirstOrDefaultAsync();

                if (existing == null)
                    return (false, null, null, null, true, false);

                if (!existing.Contains("userid") || existing["userid"].AsString != userId)
                    return (false, null, null, null, false, true);

                var srdData = await LoadSrdDataAsync();
                var validation = CharacterSheetValidator.ValidateCharacterSheet(doc, srdData);

                if (!validation.IsValid)
                    return (false, null, validation.Errors, null, false, false);

                await _db.CharacterSheets.ReplaceOneAsync(filter, doc);
                return (true, doc, null, null, false, false);
            }
            catch (Exception ex)
            {
                return (false, null, null, ex.Message, false, false);
            }
        }

        //Deletes the specified entry in the mongoDb
        public async Task<(bool Success, bool NotFound, bool Forbidden, string? ErrorMessage)> DeleteAsync(string userId, string characterId)
        {
            try
            {
                var filter = Builders<BsonDocument>.Filter.Eq("characterid", characterId);
                var existing = await _db.CharacterSheets.Find(filter).FirstOrDefaultAsync();

                if (existing == null)
                    return (false, true, false, null);

                if (!existing.Contains("userid") || existing["userid"].AsString != userId)
                    return (false, false, true, null);

                await _db.CharacterSheets.DeleteOneAsync(filter);
                return (true, false, false, null);
            }
            catch (Exception ex)
            {
                return (false, false, false, ex.Message);
            }
        }

       //Gets character summaries (ID + name) for a user - for character list display
    public async Task<List<object>> GetCharacterSummariesByUserIdAsync(string userId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userid", userId);
        var docs = await _db.CharacterSheets.Find(filter).ToListAsync();

        var summaries = new List<object>();
    
        foreach (var doc in docs)
        {
         var characterId = doc.Contains("characterid") ? doc["characterid"].AsString : "";
        
            // Try to get name from root level first, then from data object
            var characterName = "Unnamed Character";
            if (doc.Contains("name"))
            {
            characterName = doc["name"].AsString;
            }
        else if (doc.Contains("data") && doc["data"].AsBsonDocument.Contains("name"))
            {
            characterName = doc["data"]["name"].AsString;
            }

        summaries.Add(new 
        { 
            characterId = characterId,
            name = characterName
        });
    }

    return summaries;
}

        // Helper method to load SRD data for validation

        private async Task<Dictionary<string, List<BsonDocument>>> LoadSrdDataAsync()
        {
            var srdData = new Dictionary<string, List<BsonDocument>>();

            var classesFilter = Builders<BsonDocument>.Filter.Eq("Key", "classes");
            var classDocuments = await _db.SrdData.Find(classesFilter).ToListAsync();
            srdData["srd_classes"] = classDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

            var racesFilter = Builders<BsonDocument>.Filter.Eq("Key", "races");
            var raceDocuments = await _db.SrdData.Find(racesFilter).ToListAsync();
            srdData["srd_races"] = raceDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

            var skillsFilter = Builders<BsonDocument>.Filter.Eq("Key", "skills");
            var skillDocuments = await _db.SrdData.Find(skillsFilter).ToListAsync();
            srdData["srd_skills"] = skillDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

            var proficienciesFilter = Builders<BsonDocument>.Filter.Eq("Key", "proficiencies");
            var proficiencyDocuments = await _db.SrdData.Find(proficienciesFilter).ToListAsync();
            srdData["srd_proficiencies"] = proficiencyDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

            var spellsFilter = Builders<BsonDocument>.Filter.Eq("Key", "spells");
            var spellDocuments = await _db.SrdData.Find(spellsFilter).ToListAsync();
            srdData["srd_spells"] = spellDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

            var equipmentFilter = Builders<BsonDocument>.Filter.Eq("Key", "equipment");
            var equipmentDocuments = await _db.SrdData.Find(equipmentFilter).ToListAsync();
            srdData["srd_equipment"] = equipmentDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

            return srdData;
        }
    }
}