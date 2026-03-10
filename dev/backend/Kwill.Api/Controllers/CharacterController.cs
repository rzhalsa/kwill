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
    private readonly CharacterService _characterService;

    public CharacterController(CharacterService characterService) => _characterService = characterService;
    

// GET one
[HttpGet("{characterId}")]
public async Task<IActionResult> Get(string characterId)
{
    var doc = await _characterService.GetByCharacterIdAsync(characterId);

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
        var result = await _characterService.CreateAsync(doc);

        if (!result.Success)
        {
            if (result.Errors != null)
                return BadRequest(new { errors = result.Errors });

            return StatusCode(500, new { error = result.ErrorMessage });
        }

        return Content(
            result.Doc!.ToJson(new JsonWriterSettings
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
        var doc = BsonDocument.Parse(body.GetRawText());
        var result = await _characterService.UpdateAsync(userId, characterId, doc);

        if (result.NotFound)
            return NotFound();

        if (result.Forbidden)
            return Forbid();

        if (!result.Success)
        {
            if (result.Errors != null)
                return BadRequest(new { errors = result.Errors });

            return StatusCode(500, new { error = result.ErrorMessage });
        }

        return Content(
            result.Doc!.ToJson(new JsonWriterSettings
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
        var result = await _characterService.DeleteAsync(userId, characterId);

        if (result.NotFound)
            return NotFound();

        if (result.Forbidden)
            return Forbid();

        if (!result.Success)
            return StatusCode(500, new { error = result.ErrorMessage });

        return Ok(new { deleted = true });
    }
}