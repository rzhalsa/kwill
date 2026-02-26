using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using System.Text.Json;

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
            Builders<BsonDocument>.Filter.Eq("userId", userId),
            Builders<BsonDocument>.Filter.Eq("characterId", characterId)
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

    // POST (create)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        var doc = BsonDocument.Parse(body.GetRawText());
        await _db.CharacterSheets.InsertOneAsync(doc);

        return Content(
            doc.ToJson(new JsonWriterSettings
            {
                OutputMode = JsonOutputMode.RelaxedExtendedJson
            }),
            "application/json"
        );
    }

    // PUT (update)
    [HttpPut("{userId}/{characterId}")]
    public async Task<IActionResult> Update(string userId, string characterId, [FromBody] JsonElement body)
    {
        var filter = Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("userId", userId),
            Builders<BsonDocument>.Filter.Eq("characterId", characterId)
        );

        var doc = BsonDocument.Parse(body.GetRawText());

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
            Builders<BsonDocument>.Filter.Eq("userId", userId),
            Builders<BsonDocument>.Filter.Eq("characterId", characterId)
        );

        await _db.CharacterSheets.DeleteOneAsync(filter);

        return Ok(new { deleted = true });
    }
}
