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

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var docs = await _srdService.GetAllAsync();
        var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        var json = "[" + string.Join(",", docs.Select(d => d.ToJson(settings))) + "]";
        return Content(json, "application/json");
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key)
    {
        var doc = await _srdService.GetByKeyAsync(key);
        if (doc is null) return NotFound();

        var json = doc.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson });
        return Content(json, "application/json");
    }
}
