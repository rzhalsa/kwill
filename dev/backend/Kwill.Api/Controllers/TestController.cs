using KwillDB;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;


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

        [HttpGet("srd-count")]
        public async Task<IActionResult> GetSrdCount()
        {
            var count = await _db.SrdData.CountDocumentsAsync(FilterDefinition<SrdData>.Empty);
            return Ok(count);
        }
    }
}
