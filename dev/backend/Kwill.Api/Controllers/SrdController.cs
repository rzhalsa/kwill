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
    public SrdController(SrdService srdService) => _srdService = srdService;

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
            var collections = await _srdService.GetCollectionsAsync();
            return Ok(new { collections });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Get spells with optional filters
    // Frontend decides what to show based on character level
    
    [HttpGet("spells")]  //Creates endpoint /api/srd/spells
    public async Task<IActionResult> GetSpells(
        [FromQuery] string? @class = null,    //optional parameters
        [FromQuery] int? level = null)
    {
        try
        {
            var results = await _srdService.GetSpellsAsync(@class, level);  // service layer handles DB
            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", results.Select(d => d.ToJson(settings))) + "]";
            return Content(json, "application/json");    //return JSON array
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });  //Error handling
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
            var results = await _srdService.GetEquipmentAsync(category);
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
            var results = await _srdService.GetCollectionAsync(collection);

            if (results.Count == 0)
                return NotFound(new { message = $"Collection '{collection}' not found or empty" });

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
            var result = await _srdService.GetItemAsync(collection, id);

            if (result == null)
                return NotFound(new { message = $"Item '{id}' not found in collection '{collection}'" });

            var json = result.ToJson(new JsonWriterSettings
            {
                OutputMode = JsonOutputMode.RelaxedExtendedJson
            });

            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}