using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using System.Text.Json;
using Kwill.Validation;
using Kwill.Api.Helpers;

[ApiController]
[Route("api/character")]
public class CharacterController : ControllerBase
{
    private readonly CharacterService _characterService;

    public CharacterController(KwillDB.KwillDB db)
    {
        _db = db;
    }

    // POST /api/character - Create new character
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            Console.WriteLine("=== POST REQUEST RECEIVED ===");
            
            var doc = BsonDocument.Parse(body.GetRawText());
            
            // Load SRD data for validation
            var srdData = await LoadSrdDataAsync();
            
            // Validate the character
            var validation = CharacterSheetValidator.ValidateCharacterSheet(doc, srdData);
            
            if (!validation.IsValid)
            {
                Console.WriteLine($"Validation failed: {string.Join(", ", validation.Errors)}");
                return BadRequest(new { 
                    message = "Validation failed", 
                    errors = validation.Errors 
                });
            }
            
            Console.WriteLine("Validation passed - saving character");
            
            // Save to database
            await _db.CharacterSheets.InsertOneAsync(doc);
            
            // If user_id is provided, add character to user's list
            if (doc.Contains("user_id") && doc.Contains("character_id"))
            {
                string userId = doc["user_id"].AsString;
                string characterId = doc["character_id"].AsString;
                
                var userFilter = Builders<BsonDocument>.Filter.Eq("user_id", userId);
                var user = await _db.Users.Find(userFilter).FirstOrDefaultAsync();
                
                if (user != null)
                {
                    var update = Builders<BsonDocument>.Update.AddToSet("characters", characterId);
                    await _db.Users.UpdateOneAsync(userFilter, update);
                    Console.WriteLine($"Added character {characterId} to user {userId}");
                }
            }
            
            Console.WriteLine("Character saved successfully");
            
            return Content(
                doc.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating character: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET /api/character/{characterId} - Get character by ID
    [HttpGet("{characterId}")]
    public async Task<IActionResult> Get(string characterId)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("character_id", characterId);
            var character = await _db.CharacterSheets.Find(filter).FirstOrDefaultAsync();
            
            if (character == null)
            {
                return NotFound(new { message = "Character not found" });
            }
            
            return Content(
                character.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET /api/character/user/{userId} - Get all characters for a user
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserCharacters(string userId)
    {
        try
        {
            // Get character IDs from user document
            var characterIds = await ValidationHelper.GetUserCharacterIds(userId, _db);
            
            if (characterIds.Count == 0)
            {
                return Ok(new { user_id = userId, characters = new List<object>() });
            }
            
            // Get all characters
            var filter = Builders<BsonDocument>.Filter.In("character_id", characterIds);
            var characters = await _db.CharacterSheets.Find(filter).ToListAsync();
            
            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", characters.Select(c => c.ToJson(settings))) + "]";
            
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // PUT /api/character/{characterId} - Update character
    [HttpPut("{characterId}")]
    public async Task<IActionResult> Update(string characterId, [FromBody] JsonElement body)
    {
        try
        {
            Console.WriteLine($"=== PUT REQUEST RECEIVED for character: {characterId} ===");
            
            var updates = BsonDocument.Parse(body.GetRawText());
            
            // VALIDATE OWNERSHIP: Check if user owns this character
            if (updates.Contains("user_id"))
            {
                string userId = updates["user_id"].AsString;
                bool owns = await ValidationHelper.ValidateCharacterOwnership(userId, characterId, _db);
                
                if (!owns)
                {
                    Console.WriteLine($"Ownership validation failed: User {userId} does not own character {characterId}");
                    return StatusCode(403, new { message = "User does not own this character" });
                }
                
                Console.WriteLine($"Ownership validated: User {userId} owns character {characterId}");
            }
            
            // Load SRD data for validation
            var srdData = await LoadSrdDataAsync();
            
            // Validate the character
            var validation = CharacterSheetValidator.ValidateCharacterSheet(updates, srdData);
            
            if (!validation.IsValid)
            {
                Console.WriteLine($"Validation failed: {string.Join(", ", validation.Errors)}");
                return BadRequest(new { 
                    message = "Validation failed", 
                    errors = validation.Errors 
                });
            }
            
            Console.WriteLine("Validation passed - updating character");
            
            // Update the character
            var filter = Builders<BsonDocument>.Filter.Eq("character_id", characterId);
            var result = await _db.CharacterSheets.ReplaceOneAsync(filter, updates);
            
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Character not found" });
            }
            
            Console.WriteLine($"Character {characterId} updated successfully");
            
            return Content(
                updates.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating character: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // DELETE /api/character/{characterId} - Delete character
    [HttpDelete("{characterId}")]
    public async Task<IActionResult> Delete(string characterId)
    {
        try
        {
            Console.WriteLine($"=== DELETE REQUEST RECEIVED for character: {characterId} ===");
            
            // Get the character first to find the user
            var getFilter = Builders<BsonDocument>.Filter.Eq("character_id", characterId);
            var character = await _db.CharacterSheets.Find(getFilter).FirstOrDefaultAsync();
            
            if (character == null)
            {
                return NotFound(new { message = "Character not found" });
            }
            
            // Delete the character
            var deleteFilter = Builders<BsonDocument>.Filter.Eq("character_id", characterId);
            var result = await _db.CharacterSheets.DeleteOneAsync(deleteFilter);
            
            // Remove character from user's list if user_id exists
            if (character.Contains("user_id"))
            {
                string userId = character["user_id"].AsString;
                var userFilter = Builders<BsonDocument>.Filter.Eq("user_id", userId);
                var update = Builders<BsonDocument>.Update.Pull("characters", characterId);
                await _db.Users.UpdateOneAsync(userFilter, update);
                Console.WriteLine($"Removed character {characterId} from user {userId}");
            }
            
            Console.WriteLine($"Character {characterId} deleted successfully");
            
            return Ok(new { deleted = true, character_id = characterId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting character: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Helper method to load SRD data for validation
    private async Task<Dictionary<string, List<BsonDocument>>> LoadSrdDataAsync()
    {
        var srdData = new Dictionary<string, List<BsonDocument>>();

        // Load classes
        var classesFilter = Builders<BsonDocument>.Filter.Eq("Key", "classes");
        var classDocuments = await _db.SrdData.Find(classesFilter).ToListAsync();
        srdData["srd_classes"] = classDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

        // Load races
        var racesFilter = Builders<BsonDocument>.Filter.Eq("Key", "races");
        var raceDocuments = await _db.SrdData.Find(racesFilter).ToListAsync();
        srdData["srd_races"] = raceDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

        // Load spells
        var spellsFilter = Builders<BsonDocument>.Filter.Eq("Key", "spells");
        var spellDocuments = await _db.SrdData.Find(spellsFilter).ToListAsync();
        srdData["srd_spells"] = spellDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

        // Load proficiencies
        var profFilter = Builders<BsonDocument>.Filter.Eq("Key", "proficiencies");
        var profDocuments = await _db.SrdData.Find(profFilter).ToListAsync();
        srdData["srd_proficiencies"] = profDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

        // Load skills
        var skillsFilter = Builders<BsonDocument>.Filter.Eq("Key", "skills");
        var skillDocuments = await _db.SrdData.Find(skillsFilter).ToListAsync();
        srdData["srd_skills"] = skillDocuments.Select(d => d["Data"].AsBsonDocument).ToList();

        return srdData;
    }
}