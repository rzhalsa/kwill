using Kwill.Api.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;

[ApiController]
[Route("api/srd")]
public class SrdController : ControllerBase
{
    private readonly SrdService _srdService;
    public SrdController( SrdService srdService) => _srdService = srdService;

    // Get all SRD data (Kris's original endpoint)
    // GET /api/srd/all
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var docs = await _srdService.GetAllAsync();
        var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        var json = "[" + string.Join(",", docs.Select(d => d.ToJson(settings))) + "]";
        return Content(json, "application/json");
    }

    // Get all available SRD collections with counts
    // GET /api/srd/collections
    [HttpGet("collections")]
    public async Task<IActionResult> GetCollections()
    {
        try
        {
            var keys = await _db.SrdData.Distinct<string>("Key", Builders<BsonDocument>.Filter.Empty).ToListAsync();
            
            var collections = new List<object>();
            foreach (var key in keys)
            {
                var count = await _db.SrdData.CountDocumentsAsync(
                    Builders<BsonDocument>.Filter.Eq("Key", key)
                );
                collections.Add(new { name = key, count = count });
            }

            return Ok(new { collections = collections });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Get spells with optional filters
    // GET /api/srd/spells?class=wizard (all wizard spells, any level)
    // GET /api/srd/spells?level=3 (all 3rd level spells, any class)
    // GET /api/srd/spells?class=wizard&level=3 (3rd level wizard spells)
    // Frontend decides what to show based on character level
    [HttpGet("spells")]
    public async Task<IActionResult> GetSpells(
        [FromQuery] string? @class = null,
        [FromQuery] int? level = null)
    {
        try
        {
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = filterBuilder.Eq("Key", "spells");

            // Filter by class if provided (returns ALL levels for that class)
            if (!string.IsNullOrEmpty(@class))
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Eq("Data.classes", @class)
                );
            }

            // Filter by level if provided (optional - for specific queries)
            if (level.HasValue)
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Eq("Data.level", level.Value)
                );
            }

            var documents = await _db.SrdData.Find(filter).ToListAsync();
            var results = documents.Select(doc => doc["Data"].AsBsonDocument).ToList();

            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", results.Select(d => d.ToJson(settings))) + "]";
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Get equipment with optional category filter
    // GET /api/srd/equipment (all equipment)
    // GET /api/srd/equipment?category=Weapon (just weapons)
    [HttpGet("equipment")]
    public async Task<IActionResult> GetEquipment([FromQuery] string? category = null)
    {
        try
        {
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = filterBuilder.Eq("Key", "equipment");

            if (!string.IsNullOrEmpty(category))
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Eq("Data.equipment_category.name", category)
                );
            }

            var documents = await _db.SrdData.Find(filter).ToListAsync();
            var results = documents.Select(doc => doc["Data"].AsBsonDocument).ToList();

            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", results.Select(d => d.ToJson(settings))) + "]";
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Get all items from a specific SRD collection
    // GET /api/srd/classes, /api/srd/races, etc.
    [HttpGet("{collection}")]
    public async Task<IActionResult> GetCollection(string collection)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("Key", collection);
            var documents = await _db.SrdData.Find(filter).ToListAsync();

            if (documents.Count == 0)
            {
                return NotFound(new { message = $"Collection '{collection}' not found or empty" });
            }

            var results = documents.Select(doc => doc["Data"].AsBsonDocument).ToList();
            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", results.Select(d => d.ToJson(settings))) + "]";
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Get a specific item from an SRD collection by its index
    // GET /api/srd/spells/fireball, /api/srd/classes/wizard
    [HttpGet("{collection}/{id}")]
    public async Task<IActionResult> GetItem(string collection, string id)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.And(
                Builders<BsonDocument>.Filter.Eq("Key", collection),
                Builders<BsonDocument>.Filter.Eq("Data.index", id)
            );

            var document = await _db.SrdData.Find(filter).FirstOrDefaultAsync();

            if (document == null)
            {
                return NotFound(new { message = $"Item '{id}' not found in collection '{collection}'" });
            }

            var result = document["Data"].AsBsonDocument;
            var json = result.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson });
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}