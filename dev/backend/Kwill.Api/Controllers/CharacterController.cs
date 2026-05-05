using Kwill.Api.Helpers;
using Kwill.Validation;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using System.Text.Json;
using Kwill.Api.Services;

[ApiController]
[Route("api/character")]
public class CharacterController : ControllerBase
{
    private readonly CharacterService _characterService;

    public CharacterController(CharacterService characterService) => _characterService = characterService;


    // POST /api/character - Create new character
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            Console.WriteLine("=== POST REQUEST RECEIVED ===");

            // Save to database
            var doc = BsonDocument.Parse(body.GetRawText());

            var result = await _characterService.CreateAsync(doc);
            if (!result.Success)
            {
                if (result.Errors != null)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = result.Errors
                    });
                }

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
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET /api/character/{characterId} - Get character by ID
    [HttpGet("{characterId}")]
    public async Task<IActionResult> Get(Guid characterId)
    {
        try
        {
            var character = await _characterService.GetByCharacterIdAsync(characterId);

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
    public async Task<IActionResult> GetUserCharacters(Guid userId)
    {
        try
        {

            var characters = await _characterService.GetByUserIdAsync(userId);

            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", characters.Select(c => c.ToJson(settings))) + "]";

            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET /api/character/summaries/{userId} - Get character summaries for a user
    [HttpGet("summaries/{userId}")]
    public async Task<IActionResult> GetCharacterSummaries(Guid userId)
    {
        try
        {
            var summaries = await _characterService.GetCharacterSummariesByUserIdAsync(userId);

            if (summaries.Count == 0)
            {
                return Ok(new { characters = new List<object>() });
            }

            return Ok(new { characters = summaries });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // PUT /api/character/{characterId} - Update character
    [HttpPut("{characterId}")]
    public async Task<IActionResult> Update(Guid characterId, [FromBody] JsonElement body)
    {
        try
        {
            var doc = BsonDocument.Parse(body.GetRawText());

            if (!doc.Contains("userid"))
            {
                return BadRequest(new { message = "userid is required" });
            }   

            // Parse userid from string to GUID
            var userIdString = doc["userid"].AsString;
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
              return BadRequest(new { message = "Invalid userid format" });
            }
            doc.Remove("userid");
            
            var result = await _characterService.UpdateAsync(userId, characterId, doc);

            if (result.NotFound)
                return NotFound(new { message = "Character not found" });

            if (result.Forbidden)
                return StatusCode(403, new { message = "User does not own this character" });

            if (!result.Success)
            {
                if (result.Errors != null)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = result.Errors
                    });
                }

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
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // DELETE /api/character/{characterId} - Delete character
    [HttpDelete("{characterId}")]
    public async Task<IActionResult> Delete(Guid characterId, [FromQuery] Guid userId)
    {
        try
        {
            var result = await _characterService.DeleteAsync(userId, characterId);

            if (result.NotFound)
                return NotFound(new { message = "Character not found" });

            if (result.Forbidden)
                return StatusCode(403, new { message = "User does not own this character" });

            if (!result.Success)
                return StatusCode(500, new { error = result.ErrorMessage });

            return Ok(new { deleted = true, character_id = characterId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}