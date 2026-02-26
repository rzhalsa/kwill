using KwillDB;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using System.Text.Json;


namespace Kwill.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly KwillDB.KwillDB _db;

        public TestController(KwillDB.KwillDB db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("API + Mongo DI working");
        }


        [HttpPost("add-srd/{key}")]
        public async Task<IActionResult> AddSrd(string key, [FromBody] JsonElement body)
        {
            var doc = new BsonDocument
            {
                { "key", key },
                { "data", BsonDocument.Parse(body.GetRawText()) }
            };

            await _db.SrdData.InsertOneAsync(doc);

            // Return the inserted doc as JSON
            var json = doc.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson });
            return Content(json, "application/json");
        }

        [HttpGet("all-srd")]
        public async Task<IActionResult> GetAllSrd()
        {
            var docs = await _db.SrdData.Find(FilterDefinition<BsonDocument>.Empty).ToListAsync();

            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", docs.Select(d => d.ToJson(settings))) + "]";

            return Content(json, "application/json");
        }

        [HttpGet("srd/{key}")]
        public async Task<IActionResult> GetSrdByKey(string key)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("key", key);
            var doc = await _db.SrdData.Find(filter).FirstOrDefaultAsync();

            if (doc is null) return NotFound();

            var json = doc.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson });
            return Content(json, "application/json");
        }

    }
}
