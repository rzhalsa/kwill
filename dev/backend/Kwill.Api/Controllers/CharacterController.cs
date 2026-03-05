using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using System.Text.Json;
using Kwill.Validation;

[ApiController]
[Route("api/character")]
public class CharacterController : ControllerBase
{
    private readonly KwillDB.KwillDB _db;

    public CharacterController(KwillDB.KwillDB db)
    {
        _db = db;
    }

// GET one
[HttpGet("{userId}/{characterId}")]
public async Task<IActionResult> Get(string userId, string characterId)
{
    var filter = Builders<BsonDocument>.Filter.And(
        Builders<BsonDocument>.Filter.Eq("user_id", userId),        // ← Changed from "userId"
        Builders<BsonDocument>.Filter.Eq("character_id", characterId) // ← Changed from "characterId"
    );

    var doc = await _db.CharacterSheets.Find(filter).FirstOrDefaultAsync();

    if (doc == null)
        return NotFound();

    return Content(
        doc.ToJson(new JsonWriterSettings
        {
            OutputMode = JsonOutputMode.RelaxedExtendedJson
        }),
        "application/json"
    );
}

    //Returns all characters realted to a userID
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetAllByUser(string userId) {
        var filter = Builders<BsonDocument>.Filter.Eq("userId", userId);
        var doc = await _db.CharacterSheets.Find(filter).ToListAsync();
        if (doc == null)
            return NotFound();
        return Ok(doc);
    }

    // POST (create)
 [HttpPost]
public async Task<IActionResult> Create([FromBody] JsonElement body)
{
    Console.WriteLine("=== POST REQUEST RECEIVED ===");
    Console.WriteLine($"Body: {body.GetRawText()}");
    
    try
    {
        var doc = BsonDocument.Parse(body.GetRawText());
        Console.WriteLine("Parsed BsonDocument successfully");
        
        // Load SRD data for validation
        Console.WriteLine("Loading SRD data...");
        var srdData = await LoadSrdDataAsync();
        Console.WriteLine($"Loaded {srdData.Count} SRD collections");
        
        // Validate character data
        Console.WriteLine("Validating character...");
        var validation = CharacterSheetValidator.ValidateCharacterSheet(doc, srdData);
        
        if (!validation.IsValid)
        {
            Console.WriteLine($"Validation failed: {string.Join(", ", validation.Errors)}");
            return BadRequest(new { errors = validation.Errors });
        }
        
        Console.WriteLine("Validation passed!");
        await _db.CharacterSheets.InsertOneAsync(doc);
        Console.WriteLine("Character saved!");

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
        Console.WriteLine($"ERROR: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return StatusCode(500, new { error = ex.Message });
    }
}

// PUT (update)
[HttpPut("{userId}/{characterId}")]
public async Task<IActionResult> Update(string userId, string characterId, [FromBody] JsonElement body)
{
    var filter = Builders<BsonDocument>.Filter.And(
        Builders<BsonDocument>.Filter.Eq("user_id", userId),        // ← Changed
        Builders<BsonDocument>.Filter.Eq("character_id", characterId) // ← Changed
    );

        var doc = BsonDocument.Parse(body.GetRawText());
        
        // Load SRD data for validation
        var srdData = await LoadSrdDataAsync();
        
        // Validate character data
        var validation = CharacterSheetValidator.ValidateCharacterSheet(doc, srdData);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors });
        }
        
        // Only update if validation passes
        await _db.CharacterSheets.ReplaceOneAsync(filter, doc);

        return Content(
            doc.ToJson(new JsonWriterSettings
            {
                OutputMode = JsonOutputMode.RelaxedExtendedJson
            }),
            "application/json"
        );
    }

// DELETE
[HttpDelete("{userId}/{characterId}")]
public async Task<IActionResult> Delete(string userId, string characterId)
{
    var filter = Builders<BsonDocument>.Filter.And(
        Builders<BsonDocument>.Filter.Eq("user_id", userId),        // ← Changed
        Builders<BsonDocument>.Filter.Eq("character_id", characterId) // ← Changed
    );

        await _db.CharacterSheets.DeleteOneAsync(filter);

        return Ok(new { deleted = true });
    }
    
// Helper method to load SRD data for validation
private async Task<Dictionary<string, List<BsonDocument>>> LoadSrdDataAsync()
{
    var srdData = new Dictionary<string, List<BsonDocument>>();
    
    // Load classes - extract the "Data" field from each document
    var classesFilter = Builders<BsonDocument>.Filter.Eq("Key", "classes");
    var classDocuments = await _db.SrdData.Find(classesFilter).ToListAsync();
    srdData["srd_classes"] = classDocuments.Select(d => d["Data"].AsBsonDocument).ToList();
    
    // Load races
    var racesFilter = Builders<BsonDocument>.Filter.Eq("Key", "races");
    var raceDocuments = await _db.SrdData.Find(racesFilter).ToListAsync();
    srdData["srd_races"] = raceDocuments.Select(d => d["Data"].AsBsonDocument).ToList();
    
    // Load skills
    var skillsFilter = Builders<BsonDocument>.Filter.Eq("Key", "skills");
    var skillDocuments = await _db.SrdData.Find(skillsFilter).ToListAsync();
    srdData["srd_skills"] = skillDocuments.Select(d => d["Data"].AsBsonDocument).ToList();
    
    // Load proficiencies
    var proficienciesFilter = Builders<BsonDocument>.Filter.Eq("Key", "proficiencies");
    var proficiencyDocuments = await _db.SrdData.Find(proficienciesFilter).ToListAsync();
    srdData["srd_proficiencies"] = proficiencyDocuments.Select(d => d["Data"].AsBsonDocument).ToList();
    
    // Load spells
    var spellsFilter = Builders<BsonDocument>.Filter.Eq("Key", "spells");
    var spellDocuments = await _db.SrdData.Find(spellsFilter).ToListAsync();
    srdData["srd_spells"] = spellDocuments.Select(d => d["Data"].AsBsonDocument).ToList();
    
    return srdData;
}
}