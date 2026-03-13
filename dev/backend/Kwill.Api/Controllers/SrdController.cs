using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;

[ApiController]
[Route("api/srd")]
public class SrdController : ControllerBase
{
    private readonly KwillDB.KwillDB _db;
    public SrdController(KwillDB.KwillDB db) => _db = db;

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var docs = await _db.SrdData.Find(FilterDefinition<BsonDocument>.Empty).ToListAsync();
        var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        var json = "[" + string.Join(",", docs.Select(d => d.ToJson(settings))) + "]";
        return Content(json, "application/json");
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("Data.index", key);
        var doc = await _db.SrdData.Find(filter).FirstOrDefaultAsync();
        if (doc is null) return NotFound();

        var json = doc.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson });
        return Content(json, "application/json");
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API is working", timestamp = DateTime.UtcNow });
    }
}
